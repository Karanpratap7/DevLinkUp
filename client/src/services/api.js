import axios from 'axios';

// Use environment variable or fallback to localhost:5001
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/+$/, '');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
    // Ensure no double slashes in the URL
    if (config.url) {
      config.url = config.url.replace(/^\/+/, '');
    }
    // Debug log the request
    console.log('Making request:', {
      method: config.method,
      url: `${config.baseURL}/${config.url}`,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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
  login: (email, password) => {
    console.log('Login attempt:', { email });
    return api.post('api/auth/login', { email, password });
  },
  register: (name, email, password) => {
    console.log('Register attempt:', { name, email });
    return api.post('api/auth/signup', { name, email, password });
  },
  getCurrentUser: () => api.get('api/auth/me'),
};

// User API calls
export const userAPI = {
  getUser: (userId) => api.get(`api/users/${userId}`),
  getProfile: (userId) => api.get(`api/users/${userId}`),
  updateUser: (userId, data) => api.put(`api/users/${userId}`, data),
  getAllUsers: () => api.get('api/users'),
};

// Project API calls
export const projectAPI = {
  getAllProjects: () => api.get('api/projects'),
  getProject: (projectId) => api.get(`api/projects/${projectId}`),
  createProject: (data) => api.post('api/projects', data),
  updateProject: (projectId, data) => api.put(`api/projects/${projectId}`, data),
  deleteProject: (projectId) => api.delete(`api/projects/${projectId}`),
  getUserProjects: (userId) => api.get(`api/projects/user/${userId}`),
};

export default api; 