import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './Avatar';

export const ConversationItem = ({ conversation, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <Avatar
        uri={conversation.user?.profile_picture}
        name={conversation.user?.username}
        size={50}
        showOnline={true}
        isOnline={conversation.user?.is_online}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {conversation.user?.username || 'Utilisateur'}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textMuted }]}>
            {conversation.updated_at
              ? new Date(conversation.updated_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.message, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {conversation.last_message || 'Nouvelle conversation'}
          </Text>

          {conversation.unread_count > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>{conversation.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
