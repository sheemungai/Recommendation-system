import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const access = localStorage.getItem('access_token');
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/accounts/token/refresh/`, { 
            refresh: refresh 
          });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(original);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.clear();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

// ==================== API Functions ====================

export const api = {
  // ========== Authentication (accounts app) ==========
  auth: {
    register: (userData: { username: string; password: string; email: string; first_name?: string; last_name?: string }) => 
      apiClient.post('/api/accounts/register/', userData),
    
    login: (username: string, password: string) => 
      apiClient.post('/api/accounts/login/', { username, password }),
    
    refreshToken: (refresh: string) => 
      apiClient.post('/api/accounts/token/refresh/', { refresh }),
    
    getProfile: () => 
      apiClient.get('/api/accounts/profile/'),
    
    updateProfile: (data: any) => 
      apiClient.put('/api/accounts/profile/', data),
    
    logout: () => 
      apiClient.post('/api/accounts/logout/'),
    
    checkIsAdmin: () => 
      apiClient.get('/api/accounts/isadmin/'),
  },

  // ========== Students app ==========
  students: {
    // Profiles
    getProfiles: () => 
      apiClient.get('/api/profiles/'),
    
    getProfile: (id: number) => 
      apiClient.get(`/api/profiles/${id}/`),
    
    createProfile: (data: any) => 
      apiClient.post('/api/profiles/', data),
    
    updateProfile: (id: number, data: any) => 
      apiClient.put(`/api/profiles/${id}/`, data),
    
    deleteProfile: (id: number) => 
      apiClient.delete(`/api/profiles/${id}/`),
    
    getMyProfile: () => 
      apiClient.get('/api/myprofile/'),
    
    // Student Grades (from students app)
    getStudentGrades: () => 
      apiClient.get('/api/grades/'),  // From students app
    
    getStudentGrade: (id: number) => 
      apiClient.get(`/api/grades/${id}/`),  // From students app
    
    createStudentGrade: (data: any) => 
      apiClient.post('/api/grades/', data),  // From students app
    
    updateStudentGrade: (id: number, data: any) => 
      apiClient.put(`/api/grades/${id}/`, data),  // From students app
    
    deleteStudentGrade: (id: number) => 
      apiClient.delete(`/api/grades/${id}/`),  // From students app
    
    // Preferences
    getPreferences: () => 
      apiClient.get('/api/preferences/'),
    
    updatePreferences: (data: any) => 
      apiClient.put('/api/preferences/', data),
  },

  // ========== Assessment app ==========
  assessment: {
    // Questions
    getQuestions: () => 
      apiClient.get('/api/assessment/questions/'),
    
    // Admin question management
    createQuestion: (data: any) => 
      apiClient.post('/api/assessment/questions/manage/', data),
    
    updateQuestion: (id: number, data: any) => 
      apiClient.put(`/api/assessment/questions/manage/${id}/`, data),
    
    deleteQuestion: (id: number) => 
      apiClient.delete(`/api/assessment/questions/manage/${id}/`),
    
    // Responses - FIXED: Use /response/ not /submit/
    submitResponse: (data: any) => 
      apiClient.post('/api/assessment/response/', data),  // Single response
    
    submitBatchResponses: (responses: any[]) => 
      apiClient.post('/api/assessment/submit/', { responses }),  // Batch submit - this IS correct!
    
    // Results & Progress
    getResults: () => 
      apiClient.get('/api/assessment/results/'),
    
    getProgress: () => 
      apiClient.get('/api/assessment/progress/'),  // This exists in your urls.py
    
    getMyResponses: () => 
      apiClient.get('/api/assessment/myresponses/'),
  },

  // ========== Careers app ==========
  careers: {
    // Career Paths
    getCareerPaths: () => 
      apiClient.get('/api/careerpaths/'),
    
    getCareerPath: (id: number) => 
      apiClient.get(`/api/careerpaths/${id}/`),
    
    createCareerPath: (data: any) => 
      apiClient.post('/api/careerpaths/', data),
    
    updateCareerPath: (id: number, data: any) => 
      apiClient.put(`/api/careerpaths/${id}/`, data),
    
    deleteCareerPath: (id: number) => 
      apiClient.delete(`/api/careerpaths/${id}/`),
    
    // Courses
    getCourses: () => 
      apiClient.get('/api/courses/'),
    
    getCourse: (id: number) => 
      apiClient.get(`/api/courses/${id}/`),
    
    createCourse: (data: any) => 
      apiClient.post('/api/courses/', data),
    
    updateCourse: (id: number, data: any) => 
      apiClient.put(`/api/courses/${id}/`, data),
    
    deleteCourse: (id: number) => 
      apiClient.delete(`/api/courses/${id}/`),
    
    // Institutions
    getInstitutions: () => 
      apiClient.get('/api/institutions/'),
    
    getInstitution: (id: number) => 
      apiClient.get(`/api/institutions/${id}/`),
    
    createInstitution: (data: any) => 
      apiClient.post('/api/institutions/', data),
    
    updateInstitution: (id: number, data: any) => 
      apiClient.put(`/api/institutions/${id}/`, data),
    
    deleteInstitution: (id: number) => 
      apiClient.delete(`/api/institutions/${id}/`),
  },

  // ========== Cluster Calculator app ==========
  clusterCalculator: {
    // Subjects
    getSubjects: () => 
      apiClient.get('/api/subjects/'),
    
    getSubject: (id: number) => 
      apiClient.get(`/api/subjects/${id}/`),
    
    createSubject: (data: any) => 
      apiClient.post('/api/subjects/', data),
    
    updateSubject: (id: number, data: any) => 
      apiClient.put(`/api/subjects/${id}/`, data),
    
    deleteSubject: (id: number) => 
      apiClient.delete(`/api/subjects/${id}/`),
    
    // Grades - FIXED: This is different from students app grades!
    getClusterGrades: () => 
      apiClient.get('/api/grades/'),  // This is from clusterCalculator
    
    getClusterGrade: (id: number) => 
      apiClient.get(`/api/grades/${id}/`),  // This is from clusterCalculator
    
    createClusterGrade: (data: any) => 
      apiClient.post('/api/grades/', data),  // This is from clusterCalculator
    
    updateClusterGrade: (id: number, data: any) => 
      apiClient.put(`/api/grades/${id}/`, data),  // This is from clusterCalculator
    
    deleteClusterGrade: (id: number) => 
      apiClient.delete(`/api/grades/${id}/`),  // This is from clusterCalculator
    
    // Clusters
    getClusters: () => 
      apiClient.get('/api/clusters/'),
    
    getCluster: (id: number) => 
      apiClient.get(`/api/clusters/${id}/`),
    
    createCluster: (data: any) => 
      apiClient.post('/api/clusters/', data),
    
    updateCluster: (id: number, data: any) => 
      apiClient.put(`/api/clusters/${id}/`, data),
    
    deleteCluster: (id: number) => 
      apiClient.delete(`/api/clusters/${id}/`),
    
    calculateCluster: (gradeIds: number[]) => 
      apiClient.post('/api/calculate-cluster/', { grade_ids: gradeIds }),
  },

  // ========== Recommendations app ==========
  recommendations: {
    // Sessions
    getSessions: () => 
      apiClient.get('/api/recommendations/sessions/'),
    
    getSession: (id: number) => 
      apiClient.get(`/api/recommendations/sessions/${id}/`),
    
    createSession: (data?: any) => 
      apiClient.post('/api/recommendations/sessions/', data || {}),
    
    updateSession: (id: number, data: any) => 
      apiClient.put(`/api/recommendations/sessions/${id}/`, data),
    
    deleteSession: (id: number) => 
      apiClient.delete(`/api/recommendations/sessions/${id}/`),
    
    // Generate Recommendations
    generateRecommendations: (sessionId?: number, options?: any) => 
      apiClient.post('/api/recommendations/generate/', { session_id: sessionId, ...options }),
    
    // Recommendations
    getRecommendations: () => 
      apiClient.get('/api/recommendations/'),
    
    getRecommendation: (id: number) => 
      apiClient.get(`/api/recommendations/${id}/`),
    
    createRecommendation: (data: any) => 
      apiClient.post('/api/recommendations/', data),
    
    updateRecommendation: (id: number, data: any) => 
      apiClient.put(`/api/recommendations/${id}/`, data),
    
    deleteRecommendation: (id: number) => 
      apiClient.delete(`/api/recommendations/${id}/`),
  },
};

export default apiClient;