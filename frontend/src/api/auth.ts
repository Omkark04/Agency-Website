import api from './api';
export const login = async (identifier: string, password: string) => {
  const response = await api.post('/api/auth/token/', {
    email: identifier,
    password
  });
  return response.data;
};


export const refreshToken = async (refresh: string) => {
  const response = await api.post('/api/auth/token/refresh/', { refresh });
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
  const response = await api.post('/api/auth/register/client/', dataToSend);
  return response.data;
};

// Admin login using environment credentials
export const adminLogin = async (email: string, password: string) => {
  const response = await api.post('/api/auth/admin/login/', {
    email,
    password
  });
  return response.data;
};

// Change Password
export const changePassword = async (data: any) => {
  const response = await api.post('/api/auth/password/change/', data);
  return response.data;
};

// Change Email
export const changeEmail = async (data: any) => {
  const response = await api.post('/api/auth/email/change/', data);
  return response.data;
};