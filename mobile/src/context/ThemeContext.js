import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as defaultTheme } from '../config/theme';

const THEME_STORAGE_KEY = '@connectsphere_theme';

const ThemeContext = createContext({
  theme: defaultTheme,
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored !== null) {
          setIsDark(stored === 'dark');
        }
      } catch (e) {
        console.log('Error reading theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  const currentTheme = {
    ...defaultTheme,
    colors: isDark
      ? defaultTheme.colors
      : {
          ...defaultTheme.colors,
          background: '#F8FAFC',
          surface: '#FFFFFF',
          surfaceLight: '#F1F5F9',
          border: '#E2E8F0',
          text: '#0F172A',
          textSecondary: '#475569',
          textMuted: '#94A3B8',
          card: '#FFFFFF',
          inputBg: '#F1F5F9',
        },
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
