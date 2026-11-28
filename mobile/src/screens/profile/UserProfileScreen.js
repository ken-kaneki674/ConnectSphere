import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';
import { PostCard } from '../../components/PostCard';
import { api } from '../../services/api';

const REPORT_REASONS = [
  'Compte suspect ou usurpation',
  'Harcèlement ou comportement abusif',
  'Contenu inapproprié ou spam',
];

export const UserProfileScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const { userId, user: initialUser } = route?.params || {};
  const targetId = Number(userId || initialUser?.id);

  const [profile, setProfile] = useState(initialUser || null);
  const [posts, setPosts] = useState([]);
  const [friendState, setFriendState] = useState({ status: 'none', requestId: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const isOwnProfile = targetId === currentUser?.id;

  const loadData = useCallback(async () => {
    if (!targetId) return;
    try {
      const [fetchedProfile, fetchedPosts, fStatus] = await Promise.all([
        api.getUserProfile(targetId),
        api.getUserPosts(targetId),
        !isOwnProfile ? api.getFriendStatus(targetId) : Promise.resolve({ status: 'none', requestId: null }),
      ]);
      if (fetchedProfile) setProfile(fetchedProfile);
      setPosts(fetchedPosts || []);
      if (fStatus) setFriendState(fStatus);
    } catch (e) {
      console.log('Error loading user profile', e);
    } finally {
      setLoading(false);
    }
  }, [targetId, isOwnProfile]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleLikePost = async (postId) => {
    const res = await api.toggleLike(postId);
    if (res) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_liked: res.liked, likes_count: res.likes_count } : p
        )
      );
    }
  };

  const handleFriendAction = async () => {
    if (!targetId || actionLoading) return;
    setActionLoading(true);
    try {
      if (friendState.status === 'none') {
        const res = await api.sendFriendRequest(targetId);
        setFriendState(res);
      } else if (friendState.status === 'pending_received' && friendState.requestId) {
        const res = await api.respondFriendRequest(friendState.requestId, 'accept');
        setFriendState(res);
        setProfile((prev) => (prev ? { ...prev, friends_count: (prev.friends_count || 0) + 1 } : prev));
      } else if (friendState.status === 'pending_sent') {
        const res = await api.removeFriend(targetId);
        setFriendState(res);
      } else if (friendState.status === 'friends') {
        Alert.alert('Retirer cet ami', `Voulez-vous retirer ${profile?.username} de vos amis ?`, [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Retirer',
            style: 'destructive',
            onPress: async () => {
              const res = await api.removeFriend(targetId);
              setFriendState(res);
              setProfile((prev) => (prev ? { ...prev, friends_count: Math.max(0, (prev.friends_count || 1) - 1) } : prev));
            },
          },
        ]);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!targetId) return;
    const conv = await api.createConversation(targetId, profile);
    if (conv) {
      navigation.navigate('ChatDetail', { conversation: conv });
    }
  };

  const handleReportUser = async (reason) => {
    setReportModalVisible(false);
    await api.reportContent('user', targetId, reason);
    Alert.alert('Signalement envoyé', 'Merci, notre équipe de modération examinera ce signalement.');
  };

  const getFriendButtonLabel = () => {
    switch (friendState.status) {
      case 'friends':
        return { text: 'Amis', icon: 'checkmark-circle', bg: theme.colors.surfaceLight, color: theme.colors.text };
      case 'pending_sent':
        return { text: 'Demande envoyée', icon: 'time-outline', bg: theme.colors.surfaceLight, color: theme.colors.textSecondary };
      case 'pending_received':
        return { text: 'Accepter', icon: 'person-add', bg: theme.colors.success, color: '#FFF' };
      default:
        return { text: 'Ajouter', icon: 'person-add-outline', bg: theme.colors.primary, color: '#FFF' };
    }
  };

  const friendBtn = getFriendButtonLabel();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={profile?.username || 'Profil'}
        showBack={true}
        onBack={() => navigation.goBack()}
        rightAction={
          !isOwnProfile
            ? { icon: 'flag-outline', onPress: () => setReportModalVisible(true) }
            : undefined
        }
      />

      {loading && !profile ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <View>
              <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.avatarRow}>
                  <Avatar uri={profile?.profile_picture} name={profile?.username} size={76} />
                  <View style={styles.infoCol}>
                    <Text style={[styles.username, { color: theme.colors.text }]}>
                      {profile?.username || 'Membre'}
                    </Text>
                    <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
                      {profile?.bio || 'Membre de la communauté ConnectSphere 🌐'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.statsBar, { borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: theme.colors.text }]}>{profile?.posts_count ?? posts.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Posts</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: theme.colors.text }]}>{profile?.friends_count ?? 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Amis</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: theme.colors.text }]}>{profile?.groups_count ?? 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Groupes</Text>
                  </View>
                </View>

                {!isOwnProfile && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={handleFriendAction}
                      disabled={actionLoading}
                      style={[styles.actionBtn, { backgroundColor: friendBtn.bg }]}
                    >
                      <Ionicons name={friendBtn.icon} size={18} color={friendBtn.color} />
                      <Text style={[styles.actionText, { color: friendBtn.color }]}>{friendBtn.text}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleStartChat}
                      style={[styles.actionBtn, { backgroundColor: theme.colors.secondary }]}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
                      <Text style={[styles.actionText, { color: '#FFF' }]}>Message</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Publications ({posts.length})
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={handleLikePost}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
              onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
              onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={{ color: theme.colors.textMuted }}>Aucune publication pour le moment.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      <Modal visible={reportModalVisible} transparent animationType="fade" onRequestClose={() => setReportModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setReportModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Signaler {profile?.username}</Text>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => handleReportUser(reason)}
                style={[styles.reasonRow, { borderBottomColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.text, fontSize: 15 }}>{reason}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setReportModalVisible(false)} style={styles.cancelBtn}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '700' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCard: { margin: 16, padding: 18, borderRadius: 20, borderWidth: 1 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  infoCol: { flex: 1, marginLeft: 14 },
  username: { fontSize: 20, fontWeight: '800' },
  bio: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginBottom: 6 },
  emptyBox: { padding: 30, alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 18, padding: 18, borderWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  reasonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  cancelBtn: { alignItems: 'center', paddingTop: 14 },
});
