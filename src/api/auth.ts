import apiClient from './client';
import type { AuthTokens, AuthUser, RegisterPayload, LoginPayload } from '../types';

export const register = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post('/api/accounts/register/', payload);
  return data as { user: AuthUser; access: string; refresh: string; user_type: string };
};

export const login = async (payload: LoginPayload): Promise<AuthTokens> => {
  const { data } = await apiClient.post('/api/accounts/login/', payload);
  return data as AuthTokens;
};

export const logout = async (refresh: string) => {
  await apiClient.post('/api/accounts/logout/', { refresh });
};

export const getMe = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get('/api/accounts/profile/');
  return data as AuthUser;
};

export const checkAdmin = async () => {
  const { data } = await apiClient.get('/api/accounts/isadmin/');
  return data as { is_admin: boolean; user_type: string };
};
