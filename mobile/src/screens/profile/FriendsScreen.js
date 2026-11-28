import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';
import { api } from '../../services/api';

export const FriendsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests' | 'discover'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [friendsList, reqData, allUsers] = await Promise.all([
        api.getFriends(),
        api.getFriendRequests(),
        api.getUsers(),
      ]);
      setFriends(friendsList || []);
      setRequests(reqData || { incoming: [], outgoing: [] });
      setMembers(allUsers || []);
    } catch (e) {
      console.log('Error loading friends screen', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const handleRespond = async (requestId, action) => {
    await api.respondFriendRequest(requestId, action);
    await Promise.all([loadAll(), refreshUser()]);
  };

  const handleOpenChat = async (member) => {
    const conv = await api.createConversation(member.id, member);
    if (conv) navigation.navigate('ChatDetail', { conversation: conv });
  };

  const friendIds = new Set(friends.map((f) => f.id));
  const pendingIds = new Set([
    ...(requests.incoming || []).map((r) => r.user?.id),
    ...(requests.outgoing || []).map((r) => r.user?.id),
  ]);
  const suggestions = members.filter((m) => !friendIds.has(m.id));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Amis & Réseau" showBack={true} onBack={() => navigation.goBack()} />

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: theme.colors.border }]}>
        {[
          { key: 'friends', label: `Amis (${friends.length})` },
          { key: 'requests', label: `Invitations (${requests.incoming?.length || 0})` },
          { key: 'discover', label: 'Découvrir' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabBtn,
                isActive && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? theme.colors.primaryLight : theme.colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : activeTab === 'friends' ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('UserProfile', { userId: item.id, user: item })}
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Avatar uri={item.profile_picture} name={item.username} size={48} />
              <View style={styles.cardInfo}>
                <Text style={[styles.name, { color: theme.colors.text }]}>{item.username}</Text>
                <Text style={[styles.bio, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {item.bio || 'Membre ConnectSphere'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleOpenChat(item)}
                style={[styles.iconPill, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}
              >
                <Ionicons name="chatbubble-outline" size={18} color={theme.colors.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={44} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Vous n'avez pas encore d'amis. Explorez l'onglet Découvrir !
              </Text>
            </View>
          }
        />
      ) : activeTab === 'requests' ? (
        <FlatList
          data={requests.incoming || []}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserProfile', { userId: item.user?.id, user: item.user })}
                style={styles.leftTouch}
              >
                <Avatar uri={item.user?.profile_picture} name={item.user?.username} size={46} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>{item.user?.username}</Text>
                  <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>Souhaite vous ajouter</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.reqActions}>
                <TouchableOpacity
                  onPress={() => handleRespond(item.id, 'accept')}
                  style={[styles.reqBtn, { backgroundColor: theme.colors.success }]}
                >
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRespond(item.id, 'decline')}
                  style={[styles.reqBtn, { backgroundColor: theme.colors.surfaceLight }]}
                >
                  <Ionicons name="close" size={18} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="mail-open-outline" size={44} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Aucune invitation en attente.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} />}
          renderItem={({ item }) => {
            const isPending = pendingIds.has(item.id);
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('UserProfile', { userId: item.id, user: item })}
                style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <Avatar uri={item.profile_picture} name={item.username} size={46} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>{item.username}</Text>
                  <Text style={[styles.bio, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {item.bio || 'Membre ConnectSphere'}
                  </Text>
                </View>
                <TouchableOpacity
                  disabled={isPending}
                  onPress={async () => {
                    await api.sendFriendRequest(item.id);
                    loadAll();
                  }}
                  style={[
                    styles.addBtn,
                    { backgroundColor: isPending ? theme.colors.surfaceLight : theme.colors.primary },
                  ]}
                >
                  <Text style={[styles.addBtnText, { color: isPending ? theme.colors.textMuted : '#FFF' }]}>
                    {isPending ? 'En attente' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  leftTouch: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700' },
  bio: { fontSize: 13, marginTop: 2 },
  iconPill: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  reqActions: { flexDirection: 'row', gap: 8 },
  reqBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  addBtnText: { fontSize: 12, fontWeight: '700' },
  emptyBox: { alignItems: 'center', padding: 48 },
  emptyText: { marginTop: 12, fontSize: 14, textAlign: 'center' },
});
