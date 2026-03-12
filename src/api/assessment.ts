import apiClient from './client';
import type { PsychometricQuestion, PsychometricResponse, PsychometricProgress } from '../types';

export const getQuestions = async (category?: string) => {
  const params = category ? { category } : {};
  const { data } = await apiClient.get('/api/assessment/questions/', { params });
  return data.data as PsychometricQuestion[];
};

export const submitBatch = async (
  responses: { question_id: number; response_value: number }[]
) => {
  const { data } = await apiClient.post('/api/assessment/submit/', { responses });
  return data;
};

export const getResults = async () => {
  const { data } = await apiClient.get('/api/assessment/results/');
  
  // Transform the data to match what your component expects
  if (data.data && data.data.results_by_category) {
    const transformed: Record<string, { average_score: number; question_count: number; interpretation: string }> = {};
    
    data.data.results_by_category.forEach((cat: any) => {
      // Generate interpretation based on percentage
      let interpretation = 'Moderate';
      if (cat.percentage >= 75) interpretation = 'Very High';
      else if (cat.percentage >= 60) interpretation = 'High';
      else if (cat.percentage >= 40) interpretation = 'Moderate';
      else if (cat.percentage >= 25) interpretation = 'Low';
      else interpretation = 'Very Low';
      
      transformed[cat.category] = {
        average_score: cat.score,
        question_count: cat.total_questions || 0,
        interpretation
      };
    });
    
    return transformed;
  }
  
  return data.data || data;
};

export const getProgress = async () => {
  const { data } = await apiClient.get('/api/assessment/progress/');
  return data.data as PsychometricProgress;
};

export const getMyResponses = async () => {
  const { data } = await apiClient.get('/api/assessment/myresponses/');
  return data.data as PsychometricResponse[];
};