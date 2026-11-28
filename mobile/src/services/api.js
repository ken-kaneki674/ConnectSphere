import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  initialUsers,
  initialPosts,
  initialGroups,
  initialGroupPosts,
  initialGroupMessages,
  initialConversations,
  initialComments,
  initialFriendRequests,
} from './mockData';

// Determine the best backend API URL dynamically based on environment
export const getBackendUrl = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  return 'http://localhost:8000/api';
};

// Local in-memory stores for seamless offline / demo fallback
let usersStore = initialUsers.map((u) => ({ ...u }));
let postsStore = initialPosts.map((p) => ({ ...p }));
let groupsStore = initialGroups.map((g) => ({ ...g }));
let groupPostsStore = { ...initialGroupPosts };
let groupMessagesStore = { ...initialGroupMessages };
let conversationsStore = initialConversations.map((c) => ({ ...c, messages: [...(c.messages || [])] }));
let commentsStore = { ...initialComments };
let friendRequestsStore = initialFriendRequests.map((f) => ({ ...f }));
let reportsStore = [];
let authToken = null;
let currentUserId = 1;

export const setAuthToken = (token, userId = null) => {
  authToken = token;
  if (userId) currentUserId = userId;
};

/**
 * Execute an HTTP call and return a discriminated outcome so callers can distinguish
 * offline/timeout errors from server-side HTTP 4xx/5xx validation errors.
 */
const requestDetailed = async (endpoint, options = {}) => {
  const baseUrl = getBackendUrl();
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }

    if (response.ok) {
      return { ok: true, status: response.status, data };
    }
    return {
      ok: false,
      offline: false,
      status: response.status,
      error: data?.error || `Erreur serveur (${response.status})`,
      data,
    };
  } catch (err) {
    return { ok: false, offline: true, status: 0, error: err?.message || 'Serveur hors ligne' };
  }
};

const request = async (endpoint, options = {}) => {
  const res = await requestDetailed(endpoint, options);
  return res.ok ? res.data : null;
};

const getLocalDemoUser = (username = 'demo') => {
  const base = usersStore.find((u) => u.username.toLowerCase() === username.toLowerCase()) || usersStore[0];
  return {
    ...base,
    posts_count: postsStore.filter((p) => p.user?.id === base.id).length,
    friends_count: friendRequestsStore.filter(
      (f) => f.status === 1 && (f.sender_id === base.id || f.receiver_id === base.id)
    ).length,
    groups_count: groupsStore.filter((g) => g.is_member).length,
  };
};

export const api = {
  // ---------------- Auth ----------------
  async login(username, password) {
    const res = await requestDetailed('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.ok && res.data?.token) {
      setAuthToken(res.data.token, res.data.user?.id);
      return res.data;
    }

    // If backend responded with a real validation error (e.g. 401), propagate it
    if (!res.offline) {
      throw new Error(res.error || 'Identifiants invalides');
    }

    // Offline fallback only when server is unreachable
    const user = getLocalDemoUser(username || 'demo');
    setAuthToken('mock-jwt-token-connectsphere', user.id);
    return { user, token: authToken };
  },

  async demoLogin() {
    const res = await requestDetailed('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'demo', password: 'demo' }),
    });

    if (res.ok && res.data?.token) {
      setAuthToken(res.data.token, res.data.user?.id);
      return res.data;
    }

    const user = getLocalDemoUser('demo');
    setAuthToken('mock-jwt-token-connectsphere', user.id);
    return { user, token: authToken };
  },

  async register(username, email, password) {
    const res = await requestDetailed('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      if (res.data?.token) {
        setAuthToken(res.data.token, res.data.user?.id);
      }
      return res.data;
    }

    if (!res.offline) {
      throw new Error(res.error || "Erreur lors de l'inscription");
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      bio: 'Nouveau membre sur ConnectSphere 🌐',
      profile_picture: null,
      posts_count: 0,
      friends_count: 0,
      groups_count: 0,
    };
    usersStore.push(newUser);
    setAuthToken('mock-jwt-token-connectsphere', newUser.id);
    return { message: 'Compte créé avec succès !', user: newUser, token: authToken };
  },

  async refreshProfile() {
    const live = await request('/auth/profile');
    return live || null;
  },

  // ---------------- Users & Profile ----------------
  async updateProfile(fields) {
    const res = await requestDetailed('/users/me', {
      method: 'PUT',
      body: JSON.stringify(fields),
    });

    if (!res.offline && !res.ok) {
      throw new Error(res.error || 'Impossible de mettre à jour le profil');
    }

    usersStore = usersStore.map((u) => (u.id === currentUserId ? { ...u, ...fields } : u));
    return res.ok ? res.data : { ...getLocalDemoUser(), ...fields };
  },

  async getUsers() {
    const live = await request('/users');
    if (Array.isArray(live)) return live;
    return usersStore.filter((u) => u.id !== currentUserId);
  },

  async getUserProfile(userId) {
    const live = await request(`/users/${userId}`);
    if (live && live.id) return live;
    const u = usersStore.find((item) => item.id === Number(userId));
    if (!u) return null;
    return {
      ...u,
      posts_count: postsStore.filter((p) => p.user?.id === u.id).length,
      friends_count: friendRequestsStore.filter((f) => f.status === 1 && (f.sender_id === u.id || f.receiver_id === u.id)).length,
      groups_count: groupsStore.filter((g) => g.is_member).length,
    };
  },

  async getUserPosts(userId) {
    const live = await request(`/users/${userId}/posts`);
    if (Array.isArray(live)) return live;
    return postsStore.filter((p) => p.user?.id === Number(userId));
  },

  // ---------------- Posts ----------------
  async getPosts({ limit = 20, offset = 0 } = {}) {
    const live = await request(`/posts?limit=${limit}&offset=${offset}`);
    if (Array.isArray(live)) {
      return live;
    }
    return postsStore.slice(offset, offset + limit);
  },

  async getPost(postId) {
    const live = await request(`/posts/${postId}`);
    if (live && live.id) return live;
    return postsStore.find((p) => p.id === Number(postId)) || null;
  },

  async createPost(content, imagePath = null, user = null) {
    const live = await request('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image_path: imagePath }),
    });

    const newPost = live?.id
      ? live
      : {
          id: Date.now(),
          content,
          image_path: imagePath,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
          user: user || {
            id: currentUserId,
            username: 'Vous',
            profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
        };

    postsStore = [newPost, ...postsStore.filter((p) => p.id !== newPost.id)];
    return newPost;
  },

  async deletePost(postId) {
    const res = await requestDetailed(`/posts/${postId}`, { method: 'DELETE' });
    if (!res.offline && !res.ok) {
      throw new Error(res.error || 'Suppression impossible');
    }
    postsStore = postsStore.filter((p) => p.id !== Number(postId));
    Object.keys(groupPostsStore).forEach((gid) => {
      groupPostsStore[gid] = (groupPostsStore[gid] || []).filter((p) => p.id !== Number(postId));
    });
    return { deleted: true };
  },

  async toggleLike(postId) {
    const live = await request(`/likes/${postId}`, { method: 'POST' });

    postsStore = postsStore.map((p) => {
      if (p.id === postId) {
        const nextLiked = live ? Boolean(live.liked) : !p.is_liked;
        const nextCount =
          typeof live?.likes_count === 'number'
            ? live.likes_count
            : nextLiked
            ? (p.likes_count || 0) + 1
            : Math.max(0, (p.likes_count || 0) - 1);
        return { ...p, is_liked: nextLiked, liked: nextLiked, likes_count: nextCount };
      }
      return p;
    });

    const updated = postsStore.find((p) => p.id === postId);
    return live || { liked: updated?.is_liked, likes_count: updated?.likes_count };
  },

  // ---------------- Comments ----------------
  async getComments(postId) {
    const live = await request(`/comments/${postId}`);
    if (Array.isArray(live)) {
      return live;
    }
    return commentsStore[postId] || [];
  },

  async addComment(postId, content, username = 'Vous', userObj = null) {
    const live = await request(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    const newComment = live?.id
      ? live
      : {
          id: Date.now(),
          post_id: postId,
          content,
          created_at: new Date().toISOString(),
          user: {
            id: userObj?.id || currentUserId,
            username: userObj?.username || username,
            profile_picture: userObj?.profile_picture || null,
          },
        };

    if (!commentsStore[postId]) {
      commentsStore[postId] = [];
    }
    commentsStore[postId].push(newComment);

    postsStore = postsStore.map((p) =>
      p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
    );

    return newComment;
  },

  async deleteComment(commentId, postId) {
    const res = await requestDetailed(`/comments/${commentId}`, { method: 'DELETE' });
    if (!res.offline && !res.ok) {
      throw new Error(res.error || 'Suppression impossible');
    }
    if (commentsStore[postId]) {
      commentsStore[postId] = commentsStore[postId].filter((c) => c.id !== Number(commentId));
    }
    postsStore = postsStore.map((p) =>
      p.id === postId ? { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) } : p
    );
    return { deleted: true };
  },

  // ---------------- Groups & Group Activity ----------------
  async getGroups() {
    const live = await request('/groups');
    if (Array.isArray(live)) {
      return live;
    }
    return groupsStore;
  },

  async toggleJoinGroup(groupId, currentlyMember = null) {
    const existing = groupsStore.find((g) => g.id === groupId);
    const isCurrentlyMember = currentlyMember !== null ? currentlyMember : Boolean(existing?.is_member);
    const action = isCurrentlyMember ? 'leave' : 'join';

    const live = await request(`/groups/${groupId}/${action}`, { method: 'POST' });

    if (live && live.id) {
      groupsStore = groupsStore.map((g) => (g.id === groupId ? live : g));
      return live;
    }

    groupsStore = groupsStore.map((g) => {
      if (g.id === groupId) {
        const nextMember = !g.is_member;
        return {
          ...g,
          is_member: nextMember,
          members_count: nextMember ? g.members_count + 1 : Math.max(0, g.members_count - 1),
        };
      }
      return g;
    });

    return groupsStore.find((g) => g.id === groupId);
  },

  async createGroup(name, description, group_type = 'feed') {
    const live = await request('/groups', {
      method: 'POST',
      body: JSON.stringify({ name, description, group_type, privacy: 'public' }),
    });

    const newGroup = live?.id
      ? live
      : {
          id: Date.now(),
          name,
          description,
          group_type,
          members_count: 1,
          is_member: true,
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
        };
    groupsStore = [newGroup, ...groupsStore.filter((g) => g.id !== newGroup.id)];
    return newGroup;
  },

  async getGroupPosts(groupId) {
    const live = await request(`/groups/${groupId}/posts`);
    if (Array.isArray(live)) return live;
    return groupPostsStore[groupId] || [];
  },

  async createGroupPost(groupId, content, imagePath = null, user = null) {
    const live = await request(`/groups/${groupId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ content, image_path: imagePath }),
    });

    const newPost = live?.id
      ? live
      : {
          id: Date.now(),
          group_id: groupId,
          content,
          image_path: imagePath,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
          user: user || { id: currentUserId, username: 'Vous', profile_picture: null },
        };

    groupPostsStore[groupId] = [newPost, ...(groupPostsStore[groupId] || [])];
    return newPost;
  },

  async getGroupMessages(groupId) {
    const live = await request(`/groups/${groupId}/messages`);
    if (Array.isArray(live)) return live;
    return groupMessagesStore[groupId] || [];
  },

  async sendGroupMessage(groupId, content, user = null) {
    const live = await request(`/groups/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    const msg = live?.id
      ? live
      : {
          id: Date.now(),
          group_id: groupId,
          sender_id: user?.id || currentUserId,
          username: user?.username || 'Vous',
          profile_picture: user?.profile_picture || null,
          content,
          sent_at: new Date().toISOString(),
        };

    groupMessagesStore[groupId] = [...(groupMessagesStore[groupId] || []), msg];
    return msg;
  },

  // ---------------- Conversations & Messages ----------------
  async getConversations() {
    const live = await request('/messages/conversations');
    if (Array.isArray(live)) {
      return live;
    }
    return conversationsStore;
  },

  async getMessages(conversationId) {
    const live = await request(`/messages/conversations/${conversationId}`);
    if (Array.isArray(live)) {
      return live;
    }
    const conv = conversationsStore.find((c) => c.id === Number(conversationId));
    return conv?.messages || [];
  },

  async sendMessage(conversationId, content, senderId = currentUserId) {
    const live = await request(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    const newMessage = live?.id
      ? live
      : {
          id: Date.now(),
          sender_id: senderId,
          content,
          sent_at: new Date().toISOString(),
        };

    conversationsStore = conversationsStore.map((c) => {
      if (c.id === Number(conversationId)) {
        return {
          ...c,
          last_message: content,
          updated_at: new Date().toISOString(),
          messages: [...(c.messages || []), newMessage],
        };
      }
      return c;
    });

    return { ...newMessage, _fromServer: Boolean(live?.id) };
  },

  async createConversation(recipientId, recipientUser = null) {
    const live = await request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });

    if (live?.conversation) {
      return live.conversation;
    }

    let existing = conversationsStore.find((c) => c.user?.id === Number(recipientId));
    if (existing) return existing;

    const target = recipientUser || usersStore.find((u) => u.id === Number(recipientId)) || {
      id: recipientId,
      username: 'Membre',
      profile_picture: null,
    };

    const created = {
      id: Date.now(),
      user: {
        id: target.id,
        username: target.username,
        profile_picture: target.profile_picture || null,
        is_online: true,
      },
      last_message: 'Nouvelle conversation',
      unread_count: 0,
      updated_at: new Date().toISOString(),
      messages: [],
    };
    conversationsStore = [created, ...conversationsStore];
    return created;
  },

  // ---------------- Friends ----------------
  async getFriends() {
    const live = await request('/friends');
    if (Array.isArray(live)) return live;
    const friendIds = friendRequestsStore
      .filter((f) => f.status === 1 && (f.sender_id === currentUserId || f.receiver_id === currentUserId))
      .map((f) => (f.sender_id === currentUserId ? f.receiver_id : f.sender_id));
    return usersStore.filter((u) => friendIds.includes(u.id));
  },

  async getFriendRequests() {
    const live = await request('/friends/requests');
    if (live && Array.isArray(live.incoming)) return live;

    const incoming = friendRequestsStore
      .filter((f) => f.status === 0 && f.receiver_id === currentUserId)
      .map((f) => ({
        ...f,
        user: usersStore.find((u) => u.id === f.sender_id) || { id: f.sender_id, username: 'Membre' },
      }));
    const outgoing = friendRequestsStore
      .filter((f) => f.status === 0 && f.sender_id === currentUserId)
      .map((f) => ({
        ...f,
        user: usersStore.find((u) => u.id === f.receiver_id) || { id: f.receiver_id, username: 'Membre' },
      }));
    return { incoming, outgoing };
  },

  async getFriendStatus(targetId) {
    const live = await request(`/friends/status/${targetId}`);
    if (live && live.status) return live;
    const rel = friendRequestsStore.find(
      (f) => f.status !== 2 && ((f.sender_id === currentUserId && f.receiver_id === Number(targetId)) || (f.sender_id === Number(targetId) && f.receiver_id === currentUserId))
    );
    if (!rel) return { status: 'none', requestId: null };
    if (rel.status === 1) return { status: 'friends', requestId: rel.id };
    return { status: rel.sender_id === currentUserId ? 'pending_sent' : 'pending_received', requestId: rel.id };
  },

  async sendFriendRequest(targetId) {
    const live = await request(`/friends/request/${targetId}`, { method: 'POST' });
    if (live && live.status) return live;
    const newReq = { id: Date.now(), sender_id: currentUserId, receiver_id: Number(targetId), status: 0, created_at: new Date().toISOString() };
    friendRequestsStore.push(newReq);
    return { status: 'pending_sent', requestId: newReq.id };
  },

  async respondFriendRequest(requestId, action) {
    const live = await request(`/friends/respond/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    if (live && live.status) return live;
    friendRequestsStore = friendRequestsStore.map((f) =>
      f.id === Number(requestId) ? { ...f, status: action === 'accept' ? 1 : 2 } : f
    );
    return { status: action === 'accept' ? 'friends' : 'declined' };
  },

  async removeFriend(targetId) {
    const live = await request(`/friends/${targetId}`, { method: 'DELETE' });
    if (live && live.status) return live;
    friendRequestsStore = friendRequestsStore.filter(
      (f) => !((f.sender_id === currentUserId && f.receiver_id === Number(targetId)) || (f.sender_id === Number(targetId) && f.receiver_id === currentUserId))
    );
    return { status: 'none' };
  },

  // ---------------- Moderation Reports ----------------
  async reportContent(targetType, targetId, reason) {
    const live = await request('/reports', {
      method: 'POST',
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
    });
    if (live && live.report) return live;
    const report = { id: Date.now(), target_type: targetType, target_id: targetId, reason, created_at: new Date().toISOString() };
    reportsStore.push(report);
    return { message: 'Signalement enregistré', report };
  },

  // ---------------- Search ----------------
  async search(query) {
    if (!query) return { users: [], posts: [] };
    const qLower = query.toLowerCase();

    const [liveUsers, livePosts] = await Promise.all([
      request(`/users/search?q=${encodeURIComponent(query)}`),
      request('/posts'),
    ]);

    const usersToFilter = Array.isArray(liveUsers) ? liveUsers : usersStore;
    const matchingUsers = Array.isArray(liveUsers)
      ? liveUsers
      : usersToFilter.filter(
          (u) => u.username.toLowerCase().includes(qLower) || (u.bio || '').toLowerCase().includes(qLower)
        );

    const postsToFilter = Array.isArray(livePosts) ? livePosts : postsStore;
    const matchingPosts = postsToFilter.filter((p) => p.content.toLowerCase().includes(qLower));

    return { users: matchingUsers, posts: matchingPosts };
  },
};
