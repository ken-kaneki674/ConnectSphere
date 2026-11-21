import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    setError('');
    setLoading(true);
    const res = await register(username.trim(), email.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Erreur lors de la création du compte');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Créer un compte</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Rejoignez la communauté ConnectSphere en quelques secondes
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Nom d'utilisateur
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Votre pseudo unique"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { color: theme.colors.text }]}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="votre.email@exemple.com"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: theme.colors.text }]}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mot de passe</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mot de passe sécurisé"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.colors.text }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Confirmer le mot de passe
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textMuted} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.colors.text }]}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>S'inscrire</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <View style={styles.footerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primaryLight, fontWeight: '700' }}>
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 50,
  },
  backBtn: {
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
});
