import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { PostCard } from '../../components/PostCard';
import { Avatar } from '../../components/Avatar';
import { api } from '../../services/api';

export const GroupDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { group: initialGroup = {}, onUpdate } = route?.params || {};

  const [group, setGroup] = useState(initialGroup || {});
  const [groupPosts, setGroupPosts] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [sending, setSending] = useState(false);

  const isChatGroup = group?.group_type === 'chat';

  const loadActivity = useCallback(async () => {
    if (!group?.id) return;
    try {
      if (isChatGroup) {
        const msgs = await api.getGroupMessages(group.id);
        setGroupMessages(msgs || []);
      } else {
        const posts = await api.getGroupPosts(group.id);
        setGroupPosts(posts || []);
      }
    } catch (e) {
      console.log('Error loading group activity', e);
    } finally {
      setLoadingActivity(false);
    }
  }, [group?.id, isChatGroup]);

  useFocusEffect(
    useCallback(() => {
      loadActivity();
    }, [loadActivity])
  );

  const handleGroupPostLike = async (postId) => {
    const res = await api.toggleLike(postId);
    if (res) {
      setGroupPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_liked: res.liked, likes_count: res.likes_count } : p
        )
      );
    }
  };

  const handleJoinToggle = async () => {
    if (!group?.id) return;
    const updated = await api.toggleJoinGroup(group.id, group.is_member);
    if (updated) {
      setGroup(updated);
      if (onUpdate) onUpdate();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !group?.id || sending) return;
    const content = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      if (isChatGroup) {
        const msg = await api.sendGroupMessage(group.id, content, user);
        if (msg) setGroupMessages((prev) => [...prev, msg]);
      } else {
        const post = await api.createGroupPost(group.id, content, null, user);
        if (post) setGroupPosts((prev) => [post, ...prev]);
      }
    } finally {
      setSending(false);
    }
  };

  const renderGroupHeader = () => (
    <View>
      <Image
        source={{ uri: group?.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600' }}
        style={styles.banner}
      />

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.topInfo}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{group?.name || 'Groupe'}</Text>
            <Text style={[styles.type, { color: theme.colors.secondary }]}>
              {isChatGroup ? '💬 Salon de discussion' : '📰 Fil de publications'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleJoinToggle}
            style={[
              styles.actionBtn,
              {
                backgroundColor: group?.is_member ? 'transparent' : theme.colors.primary,
                borderColor: group?.is_member ? theme.colors.border : theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.actionText,
                { color: group?.is_member ? theme.colors.textSecondary : '#FFF' },
              ]}
            >
              {group?.is_member ? 'Quitter' : 'Rejoindre'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {group?.description || 'Aucune description disponible pour ce groupe.'}
        </Text>

        <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={18} color={theme.colors.primaryLight} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {group.members_count || 1}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Membres</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {group.privacy === 'private' ? 'Privé' : 'Public'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Accès</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {isChatGroup ? 'Messages du salon' : 'Publications du groupe'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={group?.name || 'Détail du groupe'} showBack={true} onBack={() => navigation.goBack()} />

      {isChatGroup ? (
        <FlatList
          data={groupMessages}
          keyExtractor={(item, idx) => String(item.id || idx)}
          ListHeaderComponent={renderGroupHeader}
          renderItem={({ item }) => {
            const isMine = item.sender_id === user?.id;
            return (
              <View style={[styles.chatRow, isMine && styles.chatRowMine]}>
                {!isMine && (
                  <Avatar uri={item.profile_picture} name={item.username || 'M'} size={32} />
                )}
                <View
                  style={[
                    styles.chatBubble,
                    isMine
                      ? { backgroundColor: theme.colors.primary }
                      : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
                  ]}
                >
                  {!isMine && (
                    <Text style={[styles.chatSender, { color: theme.colors.secondary }]}>
                      {item.username || 'Membre'}
                    </Text>
                  )}
                  <Text style={{ color: isMine ? '#FFF' : theme.colors.text, fontSize: 14, lineHeight: 20 }}>
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            loadingActivity ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={theme.colors.primary} />
            ) : (
              <View style={[styles.emptyAct, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="chatbubbles-outline" size={34} color={theme.colors.textMuted} />
                <Text style={[styles.emptyActText, { color: theme.colors.textSecondary }]}>
                  {group.is_member
                    ? 'Lancez la discussion dans ce salon !'
                    : 'Rejoignez ce groupe pour participer au salon.'}
                </Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <FlatList
          data={groupPosts}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={renderGroupHeader}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={handleGroupPostLike}
              onUserPress={(u) => navigation.navigate('UserProfile', { userId: u.id, user: u })}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
              onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id, post: item })}
              onDeleted={(id) => setGroupPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          )}
          ListEmptyComponent={
            loadingActivity ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={theme.colors.primary} />
            ) : (
              <View style={[styles.emptyAct, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="newspaper-outline" size={34} color={theme.colors.textMuted} />
                <Text style={[styles.emptyActText, { color: theme.colors.textSecondary }]}>
                  {group.is_member
                    ? 'Publiez le premier post dans ce groupe !'
                    : 'Rejoignez ce groupe pour publier et interagir.'}
                </Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {group?.is_member && (
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              paddingBottom: Math.max(10, insets.bottom),
            },
          ]}
        >
          {!isChatGroup && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CreatePost', {
                  groupId: group.id,
                  groupName: group.name,
                  selectMedia: true,
                  onPostCreated: loadActivity,
                })
              }
              style={styles.mediaBtn}
            >
              <Ionicons name="image-outline" size={22} color={theme.colors.secondary} />
            </TouchableOpacity>
          )}
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={isChatGroup ? 'Écrire dans le salon...' : 'Publier dans ce groupe...'}
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.textInput,
              { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text },
            ]}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !inputText.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.surfaceLight },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={18} color={inputText.trim() ? '#FFF' : theme.colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { width: '100%', height: 170, backgroundColor: '#334155' },
  card: { margin: 16, borderRadius: 16, padding: 16, borderWidth: 1, marginTop: -30 },
  topInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 20, fontWeight: '800' },
  type: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22, marginTop: 12 },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 12, borderTopWidth: 1, gap: 30 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 14, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginBottom: 8 },
  emptyAct: { marginHorizontal: 16, padding: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  emptyActText: { marginTop: 10, fontSize: 14, textAlign: 'center' },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', marginHorizontal: 16, marginVertical: 4, gap: 8 },
  chatRowMine: { justifyContent: 'flex-end' },
  chatBubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  chatSender: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  mediaBtn: { padding: 6, marginRight: 6 },
  textInput: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 16, borderWidth: 1, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
