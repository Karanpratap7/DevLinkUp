import axios from 'axios';

// Use environment variable or fallback to localhost:5001
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/signup', { name, email, password }),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// User API calls
export const userAPI = {
  getUser: (userId) => api.get(`/api/users/${userId}`),
  getProfile: (userId) => api.get(`/api/users/${userId}`),
  updateUser: (userId, data) => api.put(`/api/users/${userId}`, data),
  getAllUsers: () => api.get('/api/users'),
};

// Project API calls
export const projectAPI = {
  getAllProjects: () => api.get('/api/projects'),
  getProject: (projectId) => api.get(`/api/projects/${projectId}`),
  createProject: (data) => api.post('/api/projects', data),
  updateProject: (projectId, data) => api.put(`/api/projects/${projectId}`, data),
  deleteProject: (projectId) => api.delete(`/api/projects/${projectId}`),
  getUserProjects: (userId) => api.get(`/api/projects/user/${userId}`),
};

export default api; 