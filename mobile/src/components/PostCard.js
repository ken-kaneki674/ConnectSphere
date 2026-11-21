import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './Avatar';

export const PostCard = ({ post, onLike, onPress, onCommentPress }) => {
  const { theme } = useTheme();
  const [isLiked, setIsLiked] = useState(post?.is_liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);

  useEffect(() => {
    setIsLiked(post?.is_liked || false);
    setLikesCount(post?.likes_count || 0);
  }, [post?.is_liked, post?.likes_count]);

  const handleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    if (onLike && post?.id) {
      onLike(post.id);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post?.user?.username || 'Utilisateur'} sur ConnectSphere : "${post?.content || ''}"`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const formattedDate = post?.created_at
    ? new Date(post.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Récemment';

  if (!post) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          uri={post.user?.profile_picture}
          name={post.user?.username}
          size={42}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.username, { color: theme.colors.text }]}>
            {post.user?.username || 'Anonyme'}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textMuted }]}>
            {formattedDate}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: theme.colors.text }]}>
        {post.content}
      </Text>

      {/* Optional Image */}
      {post.image_path ? (
        <Image
          source={{ uri: post.image_path }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}

      {/* Footer Actions */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? theme.colors.accent : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              { color: isLiked ? theme.colors.accent : theme.colors.textSecondary },
            ]}
          >
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onCommentPress || onPress} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
            {post.comments_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
          <Ionicons name="paper-plane-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
            Partager
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#334155',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
