import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/Header';
import { api } from '../../services/api';

export const GroupDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { group: initialGroup = {}, onUpdate } = route?.params || {};
  const [group, setGroup] = useState(initialGroup || {});

  const handleJoinToggle = async () => {
    if (!group?.id) return;
    const updated = await api.toggleJoinGroup(group.id);
    if (updated) {
      setGroup(updated);
      if (onUpdate) onUpdate();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={group?.name || 'Détail du groupe'}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner image */}
        <Image
          source={{ uri: group?.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600' }}
          style={styles.banner}
        />

        {/* Group Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.topInfo}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{group?.name || 'Groupe'}</Text>
              <Text style={[styles.type, { color: theme.colors.secondary }]}>
                {group?.group_type === 'chat' ? '💬 Salon de discussion' : '📰 Fil de publications'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleJoinToggle}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: group?.is_member ? 'transparent' : theme.colors.primary,
                  borderColor: group?.is_member ? theme.colors.border : theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionText,
                  { color: group?.is_member ? theme.colors.textSecondary : '#FFF' },
                ]}
              >
                {group?.is_member ? 'Quitter' : 'Rejoindre'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {group?.description || 'Aucune description disponible pour ce groupe.'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={18} color={theme.colors.primaryLight} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {group.members_count || 1}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Membres</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>Vérifié</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Statut</Text>
            </View>
          </View>
        </View>

        {/* Discussions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Activité récente du groupe
          </Text>
          <View style={[styles.emptyAct, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="chatbubbles-outline" size={36} color={theme.colors.textMuted} />
            <Text style={[styles.emptyActText, { color: theme.colors.textSecondary }]}>
              {group.is_member
                ? 'Partagez le premier message dans ce groupe !'
                : 'Rejoignez ce groupe pour participer aux échanges.'}
            </Text>
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
    paddingBottom: 30,
  },
  banner: {
    width: '100%',
    height: 180,
    backgroundColor: '#334155',
  },
  card: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: -30,
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  type: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 30,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyAct: {
    padding: 30,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});
