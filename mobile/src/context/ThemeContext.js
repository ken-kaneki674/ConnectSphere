import React, { createContext, useContext, useState } from 'react';
import { theme as defaultTheme } from '../config/theme';

const ThemeContext = createContext({
  theme: defaultTheme,
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
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
