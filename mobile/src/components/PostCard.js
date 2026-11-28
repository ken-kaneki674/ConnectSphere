import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { api } from '../services/api';

const REPORT_REASONS = [
  'Spam ou contenu trompeur',
  'Propos injurieux ou harcèlement',
  'Contenu inapproprié',
];

export const PostCard = ({ post, onLike, onPress, onCommentPress, onUserPress, onDeleted }) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(post?.is_liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportStep, setReportStep] = useState(false);

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
    setMenuVisible(false);
    try {
      await Share.share({
        message: `${post?.user?.username || 'Utilisateur'} sur ConnectSphere : "${post?.content || ''}"`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert('Supprimer la publication', 'Voulez-vous vraiment supprimer ce post ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deletePost(post.id);
            if (onDeleted) onDeleted(post.id);
          } catch (e) {
            Alert.alert('Erreur', e?.message || 'Impossible de supprimer cette publication');
          }
        },
      },
    ]);
  };

  const handleReport = async (reason) => {
    setMenuVisible(false);
    setReportStep(false);
    await api.reportContent('post', post.id, reason);
    Alert.alert('Signalement envoyé', 'Merci. Ce contenu sera examiné par la modération.');
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

  const isOwner = currentUser?.id && (post.user?.id === currentUser.id || post.user_id === currentUser.id);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onUserPress && post.user?.id && onUserPress(post.user)}
          style={styles.authorTouch}
        >
          <Avatar uri={post.user?.profile_picture} name={post.user?.username} size={42} />
          <View style={styles.headerInfo}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {post.user?.username || 'Anonyme'}
            </Text>
            <Text style={[styles.time, { color: theme.colors.textMuted }]}>
              {formattedDate}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setReportStep(false);
            setMenuVisible(true);
          }}
          style={styles.moreButton}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: theme.colors.text }]}>{post.content}</Text>

      {/* Optional Image */}
      {post.image_path ? (
        <Image source={{ uri: post.image_path }} style={styles.postImage} resizeMode="cover" />
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
          <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>Partager</Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>

      {/* Action / Moderation Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {!reportStep ? (
              <>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Options</Text>
                {isOwner && (
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={[styles.menuRow, { borderBottomColor: theme.colors.border }]}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                    <Text style={[styles.menuText, { color: theme.colors.danger }]}>
                      Supprimer la publication
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.menuRow, { borderBottomColor: theme.colors.border }]}
                >
                  <Ionicons name="share-social-outline" size={20} color={theme.colors.text} />
                  <Text style={[styles.menuText, { color: theme.colors.text }]}>Partager</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setReportStep(true)}
                  style={[styles.menuRow, { borderBottomWidth: 0 }]}
                >
                  <Ionicons name="flag-outline" size={20} color={theme.colors.warning} />
                  <Text style={[styles.menuText, { color: theme.colors.warning }]}>
                    Signaler cette publication
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Motif du signalement
                </Text>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => handleReport(reason)}
                    style={[styles.menuRow, { borderBottomColor: theme.colors.border }]}
                  >
                    <Text style={[styles.menuText, { color: theme.colors.text, marginLeft: 0 }]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.cancelBtn}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '700' }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  authorTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingTop: 14,
  },
});
