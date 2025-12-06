import api from './index';
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/token/', { username, password });
  // Backend returns: { access, refresh, user }
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
  // Add password2 field as required by backend serializer
  const dataToSend = {
    ...userData,
    password2: userData.password
  };
  const response = await api.post('/auth/register/client/', dataToSend);
  return response.data;
};