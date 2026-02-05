import { refreshToken } from '../api/auth';

export const isAuthenticated = (): boolean => {
  const access = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');
  
  // Check if both tokens exist
  if (!access || !refresh) {
    return false;
  }
  
  // Basic validation - tokens should not be empty strings
  if (access.trim() === '' || refresh.trim() === '') {
    logout();
    return false;
  }
  
  return true;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  if (!user || user === 'undefined' || user === 'null') return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

export const refreshAuthToken = async (): Promise<boolean> => {
  const refresh = localStorage.getItem('refresh');
  if (!refresh || refresh.trim() === '') {
    logout();
    return false;
  }

  try {
    const data = await refreshToken(refresh);
    
    // Validate the response contains a new access token
    if (!data.access || data.access.trim() === '') {
      throw new Error('Invalid token response');
    }
    
    localStorage.setItem('access', data.access);
    return true;
  } catch (error: any) {
    console.error('Failed to refresh token:', error);
    
    // If refresh fails, clear all auth data
    logout();
    
    // If it's a 401 error, the refresh token is invalid/expired
    if (error.response?.status === 401) {
      console.log('Refresh token expired or invalid');
    }
    
    return false;
  }
};