import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { PostCard } from '../../components/PostCard';
import { CommentItem } from '../../components/CommentItem';
import { api } from '../../services/api';

export const PostDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { postId, post: initialPost } = route?.params || {};

  const [post, setPost] = useState(initialPost || null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!post && postId) {
          const fetchedPost = await api.getPost(postId);
          if (fetchedPost) setPost(fetchedPost);
        }
        if (postId) {
          const data = await api.getComments(postId);
          setComments(data || []);
        }
      } catch (e) {
        console.log('Error fetching post details/comments', e);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleSendComment = async () => {
    if (!commentText.trim() || !postId) return;

    const content = commentText.trim();
    setCommentText('');
    setSending(true);

    try {
      const added = await api.addComment(postId, content, user?.username || 'Vous');
      if (added) {
        setComments((prev) => [...prev, added]);
        setPost((prev) => (prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : prev));
      }
    } catch (e) {
      console.log('Error sending comment', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title="Publication" showBack={true} onBack={() => navigation.goBack()} />

      <FlatList
        data={comments}
        keyExtractor={(item, index) => String(item.id || index)}
        ListHeaderComponent={
          <View>
            {post && (
              <PostCard
                post={post}
                onLike={() => api.toggleLike(post.id)}
              />
            )}
            <View style={styles.commentsHeader}>
              <Text style={[styles.commentsTitle, { color: theme.colors.text }]}>
                Commentaires ({comments.length})
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <CommentItem comment={item} />}
        ListEmptyComponent={
          loadingComments ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
          ) : (
            <View style={styles.emptyBox}>
              <Text style={{ color: theme.colors.textMuted }}>
                Soyez le premier à commenter cette publication !
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Comment Input Bar */}
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
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Écrire un commentaire..."
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.inputBg,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={sending || !commentText.trim()}
          style={[
            styles.sendBtn,
            {
              backgroundColor: commentText.trim()
                ? theme.colors.primary
                : theme.colors.surfaceLight,
            },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={commentText.trim() ? '#FFF' : theme.colors.textMuted}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
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
