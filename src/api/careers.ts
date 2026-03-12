import apiClient from './client';
import type { CareerPath, Course, Institution } from '../types';

export const getCareers = async () => {
  try {
    const { data } = await apiClient.get('/api/careerpaths/');
    return data as CareerPath[];
  } catch (error) {
    console.error('Error fetching careers:', error);
    throw error;
  }
};

export const getCareer = async (id: number) => {
  try {
    const { data } = await apiClient.get(`/api/careerpaths/${id}/`);
    return data as CareerPath;
  } catch (error) {
    console.error(`Error fetching career ${id}:`, error);
    throw error;
  }
};

export const getCourses = async () => {
  try {
    const { data } = await apiClient.get('/api/courses/');
    return data as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourse = async (id: number) => {
  try {
    const { data } = await apiClient.get(`/api/courses/${id}/`);
    return data as Course;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
};

export const getInstitutions = async () => {
  try {
    const { data } = await apiClient.get('/api/institutions/');
    return data as Institution[];
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
};