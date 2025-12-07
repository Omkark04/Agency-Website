import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  is_active?: boolean;
  service?: number | null;
}

export const listUsers = (params?: any) => api.get<User[]>('/auth/admin/users/', { params });
export const getUser = (id: number) => api.get<User>(`/auth/admin/users/${id}/`);
export const createUser = (data: Partial<User>) => api.post('/auth/admin/users/', data);
export const updateUser = (id: number, data: Partial<User>) => api.put(`/auth/admin/users/${id}/`, data);
export const deleteUser = (id: number) => api.delete(`/auth/admin/users/${id}/`);
