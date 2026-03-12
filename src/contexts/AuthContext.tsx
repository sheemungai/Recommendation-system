import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types';
import * as authApi from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, []);

  // Bootstrap: check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload);
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    await refreshUser();
  };

  const register = async (payload: RegisterPayload) => {
    const result = await authApi.register(payload);
    localStorage.setItem('access_token', result.access);
    localStorage.setItem('refresh_token', result.refresh);
    setUser(result.user);
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token') || '';
    try {
      await authApi.logout(refresh);
    } catch {
      // ignore
    }
    localStorage.clear();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user?.is_staff || !!user?.is_superuser;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
