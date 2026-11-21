import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';

export const EditProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(user?.profile_picture || '');

  const handleSave = () => {
    updateUser({
      username: username.trim(),
      bio: bio.trim(),
      profile_picture: profilePic.trim() || null,
    });
    Alert.alert('Succès', 'Profil mis à jour avec succès !', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
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
          <TouchableOpacity
            onPress={() =>
              setProfilePic(
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'
              )
            }
            style={[styles.changePicBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Ionicons name="camera-outline" size={16} color={theme.colors.primaryLight} />
            <Text style={[styles.changePicText, { color: theme.colors.primaryLight }]}>
              Changer photo
            </Text>
          </TouchableOpacity>
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
            URL de la photo de profil
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
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>
          </TouchableOpacity>
        </View>
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  changePicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  changePicText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 15,
  },
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
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
