import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';
import { PostCard } from '../../components/PostCard';
import { api } from '../../services/api';

const TRENDING_TOPICS = [
  { tag: '#ReactNative', count: '1.4k posts' },
  { tag: '#ConnectSphere', count: '2.8k posts' },
  { tag: '#DevWeb', count: '950 posts' },
  { tag: '#DesignSystem', count: '620 posts' },
  { tag: '#NodeJS', count: '810 posts' },
];

export const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const handleSearch = async (text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ users: [], posts: [] });
      return;
    }

    setIsSearching(true);
    try {
      const data = await api.search(text.trim());
      setResults(data);
    } catch (e) {
      console.log('Search error', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTagClick = (tag) => {
    const clean = tag.replace('#', '');
    setActiveTab('posts');
    handleSearch(clean);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header />

      {/* Search Input Bar */}
      <View style={styles.searchBarWrapper}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Rechercher des membres, posts, sujets..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.text }]}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {!query ? (
        <View style={styles.trendingSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tendances sur ConnectSphere 🔥
          </Text>
          <View style={styles.tagsContainer}>
            {TRENDING_TOPICS.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleTagClick(item.tag)}
                style={[
                  styles.tagCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.tagName, { color: theme.colors.primaryLight }]}>
                  {item.tag}
                </Text>
                <Text style={[styles.tagCount, { color: theme.colors.textMuted }]}>
                  {item.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.tabsRow, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('users')}
              style={[
                styles.tabBtn,
                activeTab === 'users' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'users' ? theme.colors.primaryLight : theme.colors.textSecondary },
                ]}
              >
                Membres ({results.users.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              style={[
                styles.tabBtn,
                activeTab === 'posts' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'posts' ? theme.colors.primaryLight : theme.colors.textSecondary },
                ]}
              >
                Publications ({results.posts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {isSearching ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
          ) : activeTab === 'users' ? (
            <FlatList
              data={results.users}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('UserProfile', { userId: item.id, user: item })}
                  style={[
                    styles.userCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  ]}
                >
                  <Avatar uri={item.profile_picture} name={item.username} size={46} />
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.colors.text }]}>
                      {item.username}
                    </Text>
                    <Text style={[styles.userBio, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {item.bio || 'Membre de ConnectSphere'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('UserProfile', { userId: item.id, user: item })}
                    style={[styles.followBtn, { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={styles.followText}>Voir</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.noResults}>
                  <Text style={{ color: theme.colors.textMuted }}>Aucun membre trouvé</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={results.posts}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <PostCard
                  post={item}
                  onLike={() => api.toggleLike(item.id)}
                  onUserPress={(u) => navigation.navigate('UserProfile', { userId: u.id, user: u })}
                  onPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
                  onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
                  onDeleted={(id) =>
                    setResults((prev) => ({
                      ...prev,
                      posts: prev.posts.filter((p) => p.id !== id),
                    }))
                  }
                />
              )}
              ListEmptyComponent={
                <View style={styles.noResults}>
                  <Text style={{ color: theme.colors.textMuted }}>Aucun post trouvé</Text>
                </View>
              }
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarWrapper: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  trendingSection: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  tagsContainer: { gap: 10 },
  tagCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagName: { fontSize: 15, fontWeight: '700' },
  tagCount: { fontSize: 13 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '700' },
  userBio: { fontSize: 13, marginTop: 2 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  followText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  noResults: { padding: 40, alignItems: 'center' },
});
