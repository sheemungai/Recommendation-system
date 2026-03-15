// api/recommendations.ts
import apiClient from './client';
import type { RecommendationsResponse } from '../types';

export const generateRecommendations = async (includeCluster: boolean = false) => {
  try {
    const { data } = await apiClient.post(
      `/api/recommendations/generate/?include_cluster=${includeCluster}`
    );
    return data as RecommendationsResponse;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const getRecommendations = async (params?: {
  item_type?: 'course' | 'institution';
  is_saved?: boolean;
  is_seen?: boolean;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.item_type) queryParams.append('item_type', params.item_type);
  if (params?.is_saved !== undefined) queryParams.append('is_saved', String(params.is_saved));
  if (params?.is_seen !== undefined) queryParams.append('is_seen', String(params.is_seen));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  
  const { data } = await apiClient.get(`/api/recommendations/?${queryParams.toString()}`);
  return data;
};

export const getDetailedRecommendations = async () => {
  const { data } = await apiClient.get('/api/recommendations/detailed/');
  return data;
};

export const getRecommendationCourseDetails = async (id: number) => {
  const { data } = await apiClient.get(`/api/recommendations/${id}/course-details/`);
  return data;
};

export const checkRecommendationsStatus = async () => {
  try {
    const { data } = await apiClient.get('/api/recommendations/status/');
    return data as {
      exists: boolean;
      lastGenerated?: string;
      count?: number;
    };
  } catch (error) {
    return { exists: false };
  }
};

export const getRecommendationsByType = async (type: 'courses' | 'institutions') => {
  const { data } = await apiClient.get(`/api/recommendations/${type}/`);
  return data;
};

export const markRecommendationSeen = async (id: number, isSeen: boolean) => {
  const { data } = await apiClient.post(`/api/recommendations/${id}/mark_seen/`, {
    is_seen: isSeen
  });
  return data;
};

export const markRecommendationSaved = async (id: number, isSaved: boolean) => {
  const { data } = await apiClient.post(`/api/recommendations/${id}/mark_saved/`, {
    is_saved: isSaved
  });
  return data;
};