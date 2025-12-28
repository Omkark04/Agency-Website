// frontend/src/api/index.ts
import axios from 'axios';
import { refreshAuthToken } from '../utils/auth';

// Get API base URL and validate
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';



const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    

    
    return config;
  },
  (error) => {

    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    

    
    // Handle 401 - Unauthorized (token refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAuthToken();
      if (refreshed) {
        const token = localStorage.getItem('access');
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } else {

      }
    }
    
    return Promise.reject(error);
  }
);

export default api;