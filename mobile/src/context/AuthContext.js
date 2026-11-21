import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

const AUTH_STORAGE_KEY = '@connectsphere_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on launch
  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setToken(parsed.token);
          setAuthToken(parsed.token);
        }
      } catch (e) {
        console.log('Error reading auth storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const data = await api.login(username, password);
      if (data && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        setAuthToken(data.token);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
        return { success: true };
      }
      return { success: false, error: 'Identifiants invalides' };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de connexion' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      const res = await api.register(username, email, password);
      // Auto login after successful registration
      return await login(username, password);
    } catch (err) {
      return { success: false, error: err.message || 'Erreur d’inscription' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setToken(null);
      setAuthToken(null);
    } catch (e) {
      console.log('Error during logout', e);
    }
  };

  const updateUser = (fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updated, token }));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
