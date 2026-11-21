import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const GroupCard = ({ group, onPress, onJoinToggle }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Image
        source={{
          uri: group.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
        }}
        style={styles.image}
      />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  group.group_type === 'chat'
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'rgba(79, 70, 229, 0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                {
                  color:
                    group.group_type === 'chat'
                      ? theme.colors.secondary
                      : theme.colors.primaryLight,
                },
              ]}
            >
              {group.group_type === 'chat' ? 'Discussion' : 'Fil de posts'}
            </Text>
          </View>
        </View>

        <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {group.description}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.memberInfo}>
            <Ionicons name="people-outline" size={14} color={theme.colors.textMuted} />
            <Text style={[styles.memberCount, { color: theme.colors.textMuted }]}>
              {group.members_count || 1} membres
            </Text>
          </View>

          <TouchableOpacity
            onPress={onJoinToggle}
            style={[
              styles.joinBtn,
              {
                backgroundColor: group.is_member
                  ? 'transparent'
                  : theme.colors.primary,
                borderColor: group.is_member
                  ? theme.colors.border
                  : theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.joinText,
                {
                  color: group.is_member
                    ? theme.colors.textSecondary
                    : theme.colors.white,
                },
              ]}
            >
              {group.is_member ? 'Membre' : 'Rejoindre'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 12,
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  joinText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
