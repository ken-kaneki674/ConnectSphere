import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { initialPosts, initialGroups, initialConversations, initialComments } from './mockData';

// Determine the best backend API URL dynamically based on environment
const getBackendUrl = () => {
  // 1. If running in Expo Go or dev client, detect Metro host IP (e.g. 192.168.1.6)
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

  // 2. Android emulator loopback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  // 3. iOS simulator / Web fallback
  return 'http://localhost:8000/api';
};

// In-memory interactive store for mobile runtime (fast & reliable offline/demo)
let postsStore = [...initialPosts];
let groupsStore = [...initialGroups];
let conversationsStore = [...initialConversations];
let commentsStore = { ...initialComments };
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

const request = async (endpoint, options = {}) => {
  const baseUrl = getBackendUrl();
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (err) {
    // Graceful fallback to in-memory store when backend is not reached
    return null;
  }
};

export const api = {
  // Auth
  async login(username, password) {
    const live = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (live && live.token) {
      authToken = live.token;
      return live;
    }

    // Mock login fallback
    const user = {
      id: 1,
      username: username || 'demo',
      email: `${username || 'demo'}@connectsphere.com`,
      bio: 'Membre actif de ConnectSphere Mobile 🌐',
      profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      posts_count: postsStore.filter((p) => p.user?.id === 1).length,
      friends_count: 12,
      groups_count: groupsStore.filter((g) => g.is_member).length,
    };
    authToken = 'mock-jwt-token-connectsphere';
    return { user, token: authToken };
  },

  async register(username, email, password) {
    const live = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (live) return live;
    return { message: 'Compte créé avec succès !' };
  },

  // Posts
  async getPosts() {
    const live = await request('/posts');
    if (Array.isArray(live) && live.length > 0) {
      // Merge with any freshly created local posts
      return live;
    }
    return postsStore;
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

    const newPost = {
      id: live?.id || Date.now(),
      content,
      image_path: imagePath,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      user: user || {
        id: 1,
        username: 'Vous',
        profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    };

    postsStore = [newPost, ...postsStore];
    return newPost;
  },

  async toggleLike(postId) {
    const live = await request(`/likes/${postId}`, { method: 'POST' });

    postsStore = postsStore.map((p) => {
      if (p.id === postId) {
        const isLiked = !p.is_liked;
        return {
          ...p,
          is_liked: isLiked,
          likes_count: isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
        };
      }
      return p;
    });

    const updated = postsStore.find((p) => p.id === postId);
    return live || { liked: updated?.is_liked, likes_count: updated?.likes_count };
  },

  // Comments
  async getComments(postId) {
    const live = await request(`/comments/${postId}`);
    if (Array.isArray(live)) {
      return live;
    }
    return commentsStore[postId] || [];
  },

  async addComment(postId, content, username = 'Vous') {
    const live = await request(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    const newComment = {
      id: live?.id || Date.now(),
      post_id: postId,
      content,
      created_at: new Date().toISOString(),
      user: {
        username,
        profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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

  // Groups
  async getGroups() {
    const live = await request('/groups');
    if (Array.isArray(live) && live.length > 0) {
      return live;
    }
    return groupsStore;
  },

  async toggleJoinGroup(groupId) {
    await request(`/groups/${groupId}/join`, { method: 'POST' });

    groupsStore = groupsStore.map((g) => {
      if (g.id === groupId) {
        const isMember = !g.is_member;
        return {
          ...g,
          is_member: isMember,
          members_count: isMember ? g.members_count + 1 : Math.max(0, g.members_count - 1),
        };
      }
      return g;
    });

    return groupsStore.find((g) => g.id === groupId);
  },

  async createGroup(name, description, group_type = 'feed') {
    const live = await request('/groups', {
      method: 'POST',
      body: JSON.stringify({ name, description, group_type }),
    });

    const newGroup = {
      id: live?.id || Date.now(),
      name,
      description,
      group_type,
      members_count: 1,
      is_member: true,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
    };
    groupsStore = [newGroup, ...groupsStore];
    return newGroup;
  },

  // Conversations & Messages
  async getConversations() {
    const live = await request('/messages/conversations');
    if (Array.isArray(live) && live.length > 0) {
      return live;
    }
    return conversationsStore;
  },

  async getMessages(conversationId) {
    const live = await request(`/messages/conversations/${conversationId}`);
    if (Array.isArray(live) && live.length > 0) {
      return live;
    }
    const conv = conversationsStore.find((c) => c.id === Number(conversationId));
    return conv?.messages || [];
  },

  async sendMessage(conversationId, content, senderId = 1) {
    await request(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    const newMessage = {
      id: Date.now(),
      sender_id: senderId,
      content,
      sent_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    conversationsStore = conversationsStore.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          last_message: content,
          updated_at: new Date().toISOString(),
          messages: [...(c.messages || []), newMessage],
        };
      }
      return c;
    });

    return newMessage;
  },

  // Search
  async search(query) {
    if (!query) return { users: [], posts: [] };
    const qLower = query.toLowerCase();

    const liveUsers = await request(`/users/search?q=${encodeURIComponent(query)}`);

    const fallbackUsers = [
      { id: 1, username: 'Admin', bio: 'Fondateur ConnectSphere' },
      { id: 2, username: 'Sophie_Dev', bio: 'Fullstack JS / React Native' },
      { id: 3, username: 'Alex_Design', bio: 'Lead Designer UI/UX' },
      { id: 4, username: 'Marc_Cloud', bio: 'DevOps & Kubernetes' },
    ];

    const usersToFilter = Array.isArray(liveUsers) && liveUsers.length > 0 ? liveUsers : fallbackUsers;
    const matchingUsers = usersToFilter.filter((u) => u.username.toLowerCase().includes(qLower));

    const matchingPosts = postsStore.filter((p) =>
      p.content.toLowerCase().includes(qLower)
    );

    return { users: matchingUsers, posts: matchingPosts };
  },
};
