import apiClient from './client';
import type { Subject, Grade, Cluster } from '../types';

export const getSubjects = async () => {
  const { data } = await apiClient.get('/api/subjects/');
  return data.results as Subject[] ?? data as Subject[];
};

export const getGrades = async () => {
  const { data } = await apiClient.get('/api/grades/');
  return data.results as Grade[] ?? data as Grade[];
};

export const getClusters = async () => {
  const { data } = await apiClient.get('/api/clusters/');
  return data.results as Cluster[] ?? data as Cluster[];
};

// This is for the cluster calculator app's own grade model (not needed for students app)
export const batchCreateGrades = async (payload: {
  grades: { subject_id: number; grade_id: number }[];
  year: number;
}) => {
  const { data } = await apiClient.post('/api/grades/batch_create/', payload);
  return data;
};

// FIXED: Calculate clusters using the students app grades
export const calculateClusters = async (year: number) => {
  try {
    // Use the correct endpoint from your updated backend
    const { data } = await apiClient.post('/api/calculations/calculate/', { year });
    
    // Handle different response formats
    if (data.status === 'success') {
      return data.data || [];
    }
    return data.data || data || [];
  } catch (error) {
    console.error('Calculate clusters error:', error);
    throw error;
  }
};

// FIXED: Get calculations with correct endpoint
export const getMyCalculations = async () => {
  try {
    const { data } = await apiClient.get('/api/calculations/');
    
    // Handle different response formats
    if (data.status === 'success') {
      return data.data || [];
    }
    return data.results || data.data || data || [];
  } catch (error) {
    console.error('Get calculations error:', error);
    return [];
  }
};

// NEW: Sync grades from students app to cluster calculator
export const syncGradesForCalculation = async (year: number) => {
  try {
    const { data } = await apiClient.post('/api/calculations/sync_grades/', { year });
    return data;
  } catch (error) {
    console.error('Sync grades error:', error);
    throw error;
  }
};

// NEW: Get latest calculations with grades summary
export const getLatestCalculations = async (year?: number) => {
  const params = year ? { year } : {};
  const { data } = await apiClient.get('/api/calculations/latest/', { params });
  return data;
};