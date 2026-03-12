import apiClient from './client';
import type { Profile, StudentGrade, GradesResponse, StudentPreferences } from '../types';

// ─── Profile ─────────────────────────────────────────────────────────────────
export const getMyProfile = async () => {
  const { data } = await apiClient.get('/api/myprofile/');
  return data.data as Profile;
};

export const createProfile = async (payload: Partial<Profile>) => {
  const { data } = await apiClient.post('/api/profiles/', payload);
  return data.data as Profile;
};

export const updateProfile = async (id: number, payload: Partial<Profile>) => {
  const { data } = await apiClient.patch(`/api/profiles/${id}/`, payload);
  return data.data as Profile;
};

export const deleteProfile = async (id: number) => {
  await apiClient.delete(`/api/profiles/${id}/`);
};

// ─── Grades ───────────────────────────────────────────────────────────────────
export const getMyGrades = async (): Promise<GradesResponse> => {
  const { data } = await apiClient.get('/api/grades/');
  return data as GradesResponse;
};

export const addGrade = async (payload: { subject: string; grade: string }) => {
  const { data } = await apiClient.post('/api/grades/', payload);
  return data.data as StudentGrade;
};

export const updateGrade = async (id: number, payload: { grade: string }) => {
  const { data } = await apiClient.patch(`/api/grades/${id}/`, payload);
  return data.data as StudentGrade;
};

export const deleteGrade = async (id: number) => {
  await apiClient.delete(`/api/grades/${id}/`);
};

// ─── Preferences ─────────────────────────────────────────────────────────────
export const getPreferences = async () => {
  const { data } = await apiClient.get('/api/preferences/');
  return data.data as StudentPreferences;
};

export const savePreferences = async (preferred_subjects: string[]) => {
  const { data } = await apiClient.post('/api/preferences/', { preferred_subjects });
  return data.data as StudentPreferences;
};
