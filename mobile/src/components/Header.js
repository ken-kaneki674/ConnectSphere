import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const Header = ({ title, showBack = false, onBack, rightAction }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          paddingTop: insets.top,
          height: 56 + insets.top,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandRow}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.brandText, { color: theme.colors.text }]}>
                Connect<Text style={{ color: theme.colors.primaryLight }}>Sphere</Text>
              </Text>
            </View>
          )}
        </View>

        {title && showBack && (
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        )}

        <View style={styles.right}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress} style={styles.iconButton}>
              <Ionicons name={rightAction.icon} size={22} color={rightAction.color || theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    justifyContent: 'flex-end',
  },
  contentRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    maxWidth: '50%',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
});
