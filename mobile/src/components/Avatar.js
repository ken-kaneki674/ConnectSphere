import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const Avatar = ({ uri, name = 'User', size = 44, showOnline = false, isOnline = false }) => {
  const { theme } = useTheme();

  const initials = (name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <View style={{ position: 'relative' }}>
      {uri ? (
        <Image source={{ uri }} style={[containerStyle, { backgroundColor: theme.colors.surfaceLight }]} />
      ) : (
        <View style={containerStyle}>
          <Text style={{ color: theme.colors.white, fontWeight: '700', fontSize: size * 0.4 }}>
            {initials}
          </Text>
        </View>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineBadge,
            {
              backgroundColor: isOnline ? theme.colors.success : theme.colors.textMuted,
              borderColor: theme.colors.surface,
              width: Math.max(10, size * 0.28),
              height: Math.max(10, size * 0.28),
              borderRadius: Math.max(5, size * 0.14),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});
