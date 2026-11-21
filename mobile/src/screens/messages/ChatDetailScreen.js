import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/Avatar';
import { api } from '../../services/api';

export const ChatDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { conversation: initialConversation = {}, onMessageSent } = route?.params || {};

  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialConversation?.messages || []);
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (conversation?.id) {
        const liveMessages = await api.getMessages(conversation.id);
        if (Array.isArray(liveMessages) && liveMessages.length > 0) {
          setMessages(liveMessages);
        }
      }
    };
    fetchChatMessages();
  }, [conversation?.id]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');

    const newMsg = {
      id: Date.now(),
      sender_id: user?.id || 1,
      content: text,
      sent_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      await api.sendMessage(conversation?.id || 1, text, user?.id || 1);
      if (onMessageSent) onMessageSent();

      // Simulated auto-reply in demo mode
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          sender_id: conversation?.user?.id || 2,
          content: 'Bien reçu ! ConnectSphere mobile est vraiment top 👌',
          sent_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, reply]);
      }, 1200);
    } catch (e) {
      console.log('Error sending message', e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Custom Chat Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            paddingTop: insets.top,
            height: 56 + insets.top,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Avatar
            uri={conversation?.user?.profile_picture}
            name={conversation?.user?.username}
            size={38}
            showOnline={true}
            isOnline={conversation?.user?.is_online}
          />

          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: theme.colors.text }]}>
              {conversation?.user?.username || 'Utilisateur'}
            </Text>
            <Text style={[styles.headerStatus, { color: theme.colors.textMuted }]}>
              {conversation?.user?.is_online ? 'En ligne' : 'Vu récemment'}
            </Text>
          </View>

          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => String(item.id || index)}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMine = item.sender_id === (user?.id || 1);
          return (
            <View
              style={[
                styles.messageRow,
                isMine ? styles.myMessageRow : styles.otherMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMine
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isMine ? '#FFF' : theme.colors.text },
                  ]}
                >
                  {item.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { color: isMine ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted },
                  ]}
                >
                  {item.sent_at}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Input Bar */}
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
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Écrire un message..."
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.textInput,
            { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputMessage.trim()}
          style={[
            styles.sendBtn,
            {
              backgroundColor: inputMessage.trim()
                ? theme.colors.primary
                : theme.colors.surfaceLight,
            },
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputMessage.trim() ? '#FFF' : theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    justifyContent: 'flex-end',
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 11,
  },
  headerIcon: {
    padding: 6,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
