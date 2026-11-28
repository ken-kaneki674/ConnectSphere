import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';
import { api } from '../../services/api';

const PRESET_IMAGES = [
  { label: 'Code', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800' },
  { label: 'Startup', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' },
  { label: 'Mobile', url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800' },
  { label: 'Sphère', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800' },
];

export const CreatePostScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { onPostCreated, groupId, groupName, selectMedia } = route?.params || {};

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(selectMedia || false);
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      if (groupId) {
        await api.createGroupPost(groupId, content.trim(), imageUrl.trim() || null, user);
      } else {
        await api.createPost(content.trim(), imageUrl.trim() || null, user);
      }
      if (onPostCreated) {
        onPostCreated();
      }
      navigation.goBack();
    } catch (e) {
      console.log('Error creating post', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={groupName ? `Publier • ${groupName}` : 'Créer une publication'}
        showBack={true}
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'checkmark',
          color: content.trim() ? theme.colors.primaryLight : theme.colors.textMuted,
          onPress: handlePublish,
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Author preview */}
        <View style={styles.authorRow}>
          <Avatar uri={user?.profile_picture} name={user?.username} size={46} />
          <View style={styles.authorInfo}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {user?.username || 'Vous'}
            </Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(79, 70, 229, 0.15)' }]}>
              <Ionicons name={groupName ? 'people-outline' : 'globe-outline'} size={12} color={theme.colors.primaryLight} />
              <Text style={[styles.badgeText, { color: theme.colors.primaryLight }]}>
                {groupName || 'Public'}
              </Text>
            </View>
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          multiline
          placeholder="De quoi souhaitez-vous discuter aujourd'hui ?"
          placeholderTextColor={theme.colors.textMuted}
          value={content}
          onChangeText={setContent}
          style={[styles.input, { color: theme.colors.text }]}
          autoFocus={true}
        />

        {/* Image Preview */}
        {imageUrl ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity onPress={() => setImageUrl('')} style={styles.removeImgBtn}>
              <Ionicons name="close" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Image Attachment Bar */}
        <View style={[styles.attachmentBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TouchableOpacity
            onPress={() => setShowImageInput(!showImageInput)}
            style={styles.attachBtn}
          >
            <Ionicons name="image-outline" size={22} color={theme.colors.secondary} />
            <Text style={[styles.attachText, { color: theme.colors.text }]}>
              {imageUrl ? "Modifier l'image" : 'Ajouter une photo'}
            </Text>
          </TouchableOpacity>

          {showImageInput && (
            <View style={styles.imageSelector}>
              <TextInput
                placeholder="Coller l'URL d'une image..."
                placeholderTextColor={theme.colors.textMuted}
                value={imageUrl}
                onChangeText={setImageUrl}
                style={[
                  styles.urlInput,
                  { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text },
                ]}
              />

              <Text style={[styles.presetLabel, { color: theme.colors.textSecondary }]}>
                Suggestions rapides :
              </Text>
              <View style={styles.presetsRow}>
                {PRESET_IMAGES.map((img, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setImageUrl(img.url)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: imageUrl === img.url ? theme.colors.primary : theme.colors.surfaceLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: imageUrl === img.url ? '#FFF' : theme.colors.textSecondary },
                      ]}
                    >
                      {img.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Publish Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePublish}
          disabled={loading || !content.trim()}
          style={[
            styles.publishButton,
            {
              backgroundColor: content.trim() ? theme.colors.primary : theme.colors.surfaceLight,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text
              style={[
                styles.publishText,
                { color: content.trim() ? '#FFF' : theme.colors.textMuted },
              ]}
            >
              Publier sur ConnectSphere
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    fontSize: 18,
    minHeight: 140,
    textAlignVertical: 'top',
    lineHeight: 26,
  },
  previewContainer: {
    position: 'relative',
    marginVertical: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#334155',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 16,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachText: {
    fontSize: 15,
    fontWeight: '600',
  },
  imageSelector: {
    marginTop: 12,
  },
  urlInput: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  presetLabel: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  publishButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  publishText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
