import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { PostCard } from '../../components/PostCard';
import { Avatar } from '../../components/Avatar';
import { api } from '../../services/api';

const PAGE_SIZE = 15;

export const FeedScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadPosts = useCallback(async () => {
    try {
      const data = await api.getPosts({ limit: PAGE_SIZE, offset: 0 });
      const list = data || [];
      setPosts(list);
      setHasMore(list.length >= PAGE_SIZE);
    } catch (e) {
      console.log('Error loading posts', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    try {
      const next = await api.getPosts({ limit: PAGE_SIZE, offset: posts.length });
      if (Array.isArray(next) && next.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          return [...prev, ...next.filter((p) => !existingIds.has(p.id))];
        });
        setHasMore(next.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId) => {
    const res = await api.toggleLike(postId);
    if (res) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_liked: res.liked, likes_count: res.likes_count }
            : p
        )
      );
    }
  };

  const handleOpenUser = (targetUser) => {
    if (!targetUser?.id) return;
    if (targetUser.id === user?.id) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('UserProfile', { userId: targetUser.id, user: targetUser });
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'media') return !!p.image_path;
    if (activeFilter === 'popular') return (p.likes_count || 0) >= 10;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header />

      {/* Quick create prompt */}
      <View
        style={[
          styles.createPrompt,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Avatar uri={user?.profile_picture} name={user?.username} size={38} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreatePost', { onPostCreated: loadPosts })}
          style={[styles.inputPlaceholder, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}
        >
          <Text style={{ color: theme.colors.textMuted }}>Exprimez-vous sur ConnectSphere...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost', { onPostCreated: loadPosts, selectMedia: true })}
          style={styles.imageIconBtn}
        >
          <Ionicons name="image-outline" size={22} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'Récents' },
          { key: 'popular', label: 'Populaires 🔥' },
          { key: 'media', label: 'Médias 📸' },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? theme.colors.white : theme.colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Posts List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={handleLike}
              onUserPress={handleOpenUser}
              onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
              onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={theme.colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Aucune publication pour le moment.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreatePost', { onPostCreated: loadPosts })}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  createPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  inputPlaceholder: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginHorizontal: 10,
    borderWidth: 1,
  },
  imageIconBtn: { padding: 6 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, marginTop: 12 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
