import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './Avatar';

export const CommentItem = ({ comment }) => {
  const { theme } = useTheme();

  const formattedDate = comment.created_at
    ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={styles.container}>
      <Avatar
        uri={comment.user?.profile_picture}
        name={comment.user?.username}
        size={36}
      />
      <View
        style={[
          styles.bubble,
          { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.bubbleHeader}>
          <Text style={[styles.username, { color: theme.colors.text }]}>
            {comment.user?.username || 'Utilisateur'}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textMuted }]}>
            {formattedDate}
          </Text>
        </View>
        <Text style={[styles.content, { color: theme.colors.text }]}>
          {comment.content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  bubble: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
});
