import api from './api';

export interface Service {
  id: number;
  title: string;
  slug?: string;
  logo?: string | null;
  short_description?: string;
  long_description?: string;
  department: number;
  is_active: boolean;
  created_by?: any | null;
  created_at?: string;
  updated_at?: string;
}

export const listServices = (params?: any) => api.get<Service[]>('/api/services/', { params });
export const getService = (id: number) => api.get<Service>(`/api/services/${id}/`);
export const createService = (data: Partial<Service>) => api.post('/api/services/', data);
export const updateService = (id: number, data: Partial<Service>) => api.put(`/api/services/${id}/`, data);
export const deleteService = (id: number) => api.delete(`/api/services/${id}/`);
