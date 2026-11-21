import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/Header';
import { api } from '../../services/api';

export const CreateGroupScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const onGroupCreated = route?.params?.onGroupCreated;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('feed'); // 'feed' or 'chat'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Veuillez entrer un nom de groupe');
      return;
    }

    setLoading(true);
    try {
      await api.createGroup(name.trim(), description.trim(), groupType);
      if (onGroupCreated) onGroupCreated();
      navigation.goBack();
    } catch (e) {
      setError('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Créer un groupe"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Group Name */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nom du groupe *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="ex: Passion React Native"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text }]}
          />

          {/* Description */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Quel est l'objectif ou le thème de ce groupe ?"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={[styles.textArea, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text }]}
          />

          {/* Group Type Selector */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type d'espace</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              onPress={() => setGroupType('feed')}
              style={[
                styles.typeOption,
                {
                  borderColor: groupType === 'feed' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: groupType === 'feed' ? 'rgba(79, 70, 229, 0.15)' : theme.colors.inputBg,
                },
              ]}
            >
              <Ionicons
                name="newspaper-outline"
                size={22}
                color={groupType === 'feed' ? theme.colors.primaryLight : theme.colors.textMuted}
              />
              <Text style={[styles.typeTitle, { color: theme.colors.text }]}>Fil de posts</Text>
              <Text style={[styles.typeDesc, { color: theme.colors.textSecondary }]}>
                Publications & commentaires
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGroupType('chat')}
              style={[
                styles.typeOption,
                {
                  borderColor: groupType === 'chat' ? theme.colors.secondary : theme.colors.border,
                  backgroundColor: groupType === 'chat' ? 'rgba(6, 182, 212, 0.15)' : theme.colors.inputBg,
                },
              ]}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color={groupType === 'chat' ? theme.colors.secondary : theme.colors.textMuted}
              />
              <Text style={[styles.typeTitle, { color: theme.colors.text }]}>Salon Chat</Text>
              <Text style={[styles.typeDesc, { color: theme.colors.textSecondary }]}>
                Messages instantanés
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Créer le groupe</Text>
            )}
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
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  error: {
    color: '#EF4444',
    marginBottom: 12,
    fontSize: 13,
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
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  typeOption: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  typeDesc: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
