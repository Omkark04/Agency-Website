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
  timeout: 60000, // 60 second timeout (increased for payment processing)
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
        // Refresh failed - logout user and redirect to login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        // Redirect to login page with message
        window.location.href = '/login?session_expired=true';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;