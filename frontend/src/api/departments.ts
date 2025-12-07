import api from './api';

export interface Department {
  id: number;
  title: string;
  slug?: string;
  logo?: string | null; // Cloudinary URL
  short_description?: string;
  team_head?: any | null;
  is_active: boolean;
  created_at?: string;
}

export const listDepartments = (params?: any) => api.get<Department[]>('/api/departments/', { params });
export const getDepartment = (id: number) => api.get<Department>(`/api/departments/${id}/`);
export const createDepartment = (data: Partial<Department>) => api.post('/api/departments/', data);
export const updateDepartment = (id: number, data: Partial<Department>) => api.put(`/api/departments/${id}/`, data);
export const partialUpdateDepartment = (id: number, data: Partial<Department>) => api.patch(`/api/departments/${id}/`, data);
export const deleteDepartment = (id: number) => api.delete(`/api/departments/${id}/`);
