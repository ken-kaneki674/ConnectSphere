import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/Header';
import { ConversationItem } from '../../components/ConversationItem';
import { Avatar } from '../../components/Avatar';
import { api } from '../../services/api';

export const MessagesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newChatModal, setNewChatModal] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data || []);
    } catch (e) {
      console.log('Error loading messages', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const handleOpenNewChat = async () => {
    setNewChatModal(true);
    const list = await api.getUsers();
    setMembers(list || []);
  };

  const handleSelectMember = async (member) => {
    setNewChatModal(false);
    const conv = await api.createConversation(member.id, member);
    if (conv) {
      loadConversations();
      navigation.navigate('ChatDetail', {
        conversation: conv,
        onMessageSent: loadConversations,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        rightAction={{
          icon: 'create-outline',
          onPress: handleOpenNewChat,
        }}
      />

      <View style={styles.headerTitle}>
        <Text style={[styles.screenTitle, { color: theme.colors.text }]}>Messages</Text>
        <TouchableOpacity
          onPress={handleOpenNewChat}
          style={[styles.newBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.newBtnText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadConversations();
              }}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  conversation: item,
                  onMessageSent: loadConversations,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Aucune conversation active pour le moment.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* New Conversation Member Picker */}
      <Modal
        visible={newChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setNewChatModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Nouvelle conversation
              </Text>
              <TouchableOpacity onPress={() => setNewChatModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={members}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectMember(item)}
                  style={[styles.memberRow, { borderBottomColor: theme.colors.border }]}
                >
                  <Avatar uri={item.profile_picture} name={item.username} size={42} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.memberName, { color: theme.colors.text }]}>
                      {item.username}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
                      {item.bio || 'Membre ConnectSphere'}
                    </Text>
                  </View>
                  <Ionicons name="chatbubble-outline" size={18} color={theme.colors.primaryLight} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: theme.colors.textMuted, textAlign: 'center', padding: 20 }}>
                  Aucun autre membre disponible.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  screenTitle: { fontSize: 22, fontWeight: '800' },
  newBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  newBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { maxHeight: '70%', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderTopWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  memberName: { fontSize: 15, fontWeight: '700' },
});
