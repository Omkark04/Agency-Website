import { refreshToken } from '../api/auth';

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('access') !== null;
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
};

export const refreshAuthToken = async (): Promise<boolean> => {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) {
    logout();
    return false;
  }

  try {
    const data = await refreshToken(refresh);
    localStorage.setItem('access', data.access);
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    logout();
    return false;
  }
};