import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  notificationsEnabled: true,
  login: async () => {},
  demoLogin: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
  toggleNotifications: () => {},
});

const AUTH_STORAGE_KEY = '@connectsphere_auth';
const NOTIF_STORAGE_KEY = '@connectsphere_notifications';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const [storedAuth, storedNotif] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(NOTIF_STORAGE_KEY),
        ]);
        if (storedNotif !== null) {
          setNotificationsEnabled(storedNotif === 'true');
        }
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setUser(parsed.user);
          setToken(parsed.token);
          setAuthToken(parsed.token, parsed.user?.id);
        }
      } catch (e) {
        console.log('Error reading auth storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const persistSession = async (data) => {
    setUser(data.user);
    setToken(data.token);
    setAuthToken(data.token, data.user?.id);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  };

  const login = async (username, password) => {
    try {
      const data = await api.login(username, password);
      if (data && data.user && data.token) {
        await persistSession(data);
        return { success: true };
      }
      return { success: false, error: 'Identifiants invalides' };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de connexion' };
    }
  };

  const demoLogin = async () => {
    try {
      const data = await api.demoLogin();
      if (data && data.user && data.token) {
        await persistSession(data);
        return { success: true };
      }
      return { success: false, error: 'Impossible de démarrer la session démo' };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de connexion démo' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.register(username, email, password);
      if (res && res.user && res.token) {
        await persistSession({ user: res.user, token: res.token });
        return { success: true };
      }
      return await login(username, password);
    } catch (err) {
      return { success: false, error: err.message || 'Erreur d’inscription' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setToken(null);
      setAuthToken(null, null);
    } catch (e) {
      console.log('Error during logout', e);
    }
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const latest = await api.refreshProfile();
    if (latest && latest.id) {
      setUser((prev) => {
        const merged = { ...prev, ...latest };
        AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: merged, token })).catch(() => {});
        return merged;
      });
    }
  }, [token]);

  const updateUser = async (fields) => {
    const saved = await api.updateProfile(fields);
    setUser((prev) => {
      const updated = { ...prev, ...fields, ...(saved || {}) };
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updated, token })).catch(() => {});
      return updated;
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      AsyncStorage.setItem(NOTIF_STORAGE_KEY, String(next)).catch(() => {});
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        notificationsEnabled,
        login,
        demoLogin,
        register,
        logout,
        updateUser,
        refreshUser,
        toggleNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
