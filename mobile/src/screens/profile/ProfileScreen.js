import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';

export const ProfileScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de ConnectSphere ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card Header */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.avatarRow}>
            <Avatar uri={user?.profile_picture} name={user?.username} size={80} />
            <View style={styles.profileDetails}>
              <Text style={[styles.username, { color: theme.colors.text }]}>
                {user?.username || 'Utilisateur'}
              </Text>
              <Text style={[styles.email, { color: theme.colors.textMuted }]}>
                {user?.email || 'email@connectsphere.com'}
              </Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(79, 70, 229, 0.15)' }]}>
                <Ionicons name="sparkles" size={12} color={theme.colors.primaryLight} />
                <Text style={[styles.badgeText, { color: theme.colors.primaryLight }]}>
                  Membre ConnectSphere
                </Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
            {user?.bio || 'Passionné de technologie, développement mobile et web sur ConnectSphere 🌐'}
          </Text>

          {/* Stats Bar */}
          <View style={[styles.statsBar, { borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {user?.posts_count || 3}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Posts</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {user?.friends_count || 12}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Amis</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {user?.groups_count || 2}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Groupes</Text>
            </View>
          </View>

          {/* Profile Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              style={[styles.editBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons name="create-outline" size={18} color="#FFF" />
              <Text style={styles.editBtnText}>Modifier profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutBtn, { borderColor: theme.colors.danger }]}
            >
              <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings & Options List */}
        <View style={[styles.optionsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            PARAMÈTRES & PRÉFÉRENCES
          </Text>

          {/* Dark Mode toggle item */}
          <TouchableOpacity onPress={toggleTheme} style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={22}
                color={theme.colors.primaryLight}
              />
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                Mode sombre
              </Text>
            </View>
            <Text style={{ color: theme.colors.textMuted }}>
              {isDark ? 'Activé' : 'Désactivé'}
            </Text>
          </TouchableOpacity>

          {/* Notification settings */}
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.secondary} />
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                Notifications push
              </Text>
            </View>
            <Text style={{ color: theme.colors.success, fontWeight: '600' }}>Activées</Text>
          </View>

          {/* Version info */}
          <View style={[styles.optionItem, { borderBottomWidth: 0 }]}>
            <View style={styles.optionLeft}>
              <Ionicons name="phone-portrait-outline" size={22} color={theme.colors.textMuted} />
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                ConnectSphere Mobile
              </Text>
            </View>
            <Text style={{ color: theme.colors.textMuted }}>v1.0.0 (React Native)</Text>
          </View>
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
    paddingBottom: 40,
  },
  profileCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
