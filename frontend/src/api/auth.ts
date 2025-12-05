import api from './index';
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/token/', { username, password });  // Already correct
  return response.data;
};

export const refreshToken = async (refresh: string) => {
  const response = await api.post('/auth/token/refresh/', { refresh });  // Already correct
  return response.data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
}) => {
  const response = await api.post('/auth/register/client/', userData);  // Already correct
  return response.data;
};