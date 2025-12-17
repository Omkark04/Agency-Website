import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  job_title?: string;
  is_active?: boolean;
  service?: number | null;
  department?: number | null;
}

export const listUsers = (params?: any) => api.get<User[]>('/api/auth/admin/users/', { params });
export const getUser = (id: number) => api.get<User>(`/api/auth/admin/users/${id}/`);
export const createUser = (data: Partial<User>) => api.post('/api/auth/admin/users/', data);
export const updateUser = (id: number, data: Partial<User>) => api.put(`/api/auth/admin/users/${id}/`, data);
export const deleteUser = (id: number) => api.delete(`/api/auth/admin/users/${id}/`);

// Profile API
export const getProfile = () => api.get<User>('/api/auth/profile/');
export const updateProfile = (data: Partial<User>) => api.patch('/api/auth/profile/', data);
