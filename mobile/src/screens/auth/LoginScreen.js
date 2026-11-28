import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { login, demoLogin } = useAuth();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (customUser, customPass) => {
    const userToLogin = customUser || username.trim();
    const passToLogin = customPass || password;

    if (!userToLogin || !passToLogin) {
      setError('Veuillez renseigner votre identifiant et mot de passe');
      return;
    }

    setError('');
    setLoading(true);
    const res = await login(userToLogin, passToLogin);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Erreur lors de la connexion');
    }
  };

  const handleQuickDemo = async () => {
    setUsername('demo');
    setPassword('demo');
    setError('');
    setLoading(true);
    const res = await demoLogin();
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Erreur lors de la connexion démo');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Brand Header */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/logo-sphere.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
            Connect<Text style={{ color: theme.colors.primaryLight }}>Sphere</Text>
          </Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
            Votre réseau social nouvelle génération sur mobile
          </Text>
        </View>

        {/* Login Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Connexion</Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Nom d'utilisateur ou Email
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
                placeholder="ex: lawson_dev ou demo"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { color: theme.colors.text }]}
                autoCapitalize="none"
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
                placeholder="Votre mot de passe"
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

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleLogin()}
            disabled={loading}
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleQuickDemo}
            style={[
              styles.demoButton,
              { borderColor: theme.colors.primaryLight, backgroundColor: 'rgba(99, 102, 241, 0.1)' },
            ]}
          >
            <Ionicons name="flash-outline" size={18} color={theme.colors.primaryLight} />
            <Text style={[styles.demoText, { color: theme.colors.primaryLight }]}>
              Connexion Rapide (Compte Démo)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Link to Register */}
        <View style={styles.footerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: theme.colors.primaryLight, fontWeight: '700' }}>
              Créer un compte
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
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
    marginTop: 10,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoButton: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});
