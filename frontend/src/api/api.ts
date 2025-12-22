// frontend/src/api/index.ts
import axios from 'axios';
import { refreshAuthToken } from '../utils/auth';

// Get API base URL and validate
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Production logging
if (import.meta.env.PROD) {
  console.log('🚀 Production API Configuration:', {
    baseURL: API_BASE,
    mode: import.meta.env.MODE,
    timestamp: new Date().toISOString()
  });
}

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
    
    // Production request logging
    if (import.meta.env.PROD) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
        hasAuth: !!token,
        timestamp: new Date().toISOString()
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Production response logging
    if (import.meta.env.PROD) {
      console.log('📥 API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Enhanced error logging for production
    console.error('❌ API Error:', {
      message: error.message,
      method: originalRequest?.method?.toUpperCase(),
      url: originalRequest?.url,
      fullURL: originalRequest?.baseURL + originalRequest?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    
    // Handle 401 - Unauthorized (token refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 Attempting token refresh...');
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        const token = localStorage.getItem('access');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token refreshed, retrying request');
        return api(originalRequest);
      } else {
        console.error('❌ Token refresh failed');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;