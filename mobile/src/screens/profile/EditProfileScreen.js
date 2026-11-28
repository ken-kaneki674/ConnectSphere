import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
];

export const EditProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(user?.profile_picture || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Erreur', "Le nom d'utilisateur ne peut pas être vide.");
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        username: username.trim(),
        bio: bio.trim(),
        profile_picture: profilePic.trim() || null,
      });
      Alert.alert('Succès', 'Profil mis à jour avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e?.message || 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Modifier le profil"
        showBack={true}
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'checkmark',
          color: theme.colors.primaryLight,
          onPress: handleSave,
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <Avatar uri={profilePic} name={username} size={90} />
          <Text style={[styles.presetTitle, { color: theme.colors.textSecondary }]}>
            Choisir un avatar rapide :
          </Text>
          <View style={styles.presetsRow}>
            {AVATAR_PRESETS.map((url, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setProfilePic(url)}
                style={[
                  styles.presetBtn,
                  {
                    borderColor: profilePic === url ? theme.colors.primaryLight : theme.colors.border,
                    borderWidth: profilePic === url ? 2 : 1,
                  },
                ]}
              >
                <Image source={{ uri: url }} style={styles.presetImg} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nom d'utilisateur</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text }]}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Écrivez quelques mots sur vous..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.textArea, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text }]}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            URL personnalisée de photo de profil
          </Text>
          <TextInput
            value={profilePic}
            onChangeText={setProfilePic}
            placeholder="https://..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text }]}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  avatarSection: { alignItems: 'center', marginVertical: 14 },
  presetTitle: { fontSize: 12, marginTop: 12, marginBottom: 8 },
  presetsRow: { flexDirection: 'row', gap: 10 },
  presetBtn: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden' },
  presetImg: { width: '100%', height: '100%' },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, fontSize: 15 },
  textArea: {
    minHeight: 90,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
