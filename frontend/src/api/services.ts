import api from './api';

export interface ServiceFeature {
  id: number;
  title: string;
  description?: string;
  order_index: number;
}

export interface Service {
  id: number;
  title: string;
  slug?: string;
  logo?: string | null;
  short_description: string;
  long_description?: string;
  department: number;
  department_title?: string;
  icon_name: 'palette' | 'laptop-code' | 'graduation-cap' | 'megaphone' | 'chart-line' | 'code' | 'mobile' | 'brush';
  gradient_colors: string; // e.g., "from-[#00C2A8] to-[#00A5C2]"
  is_featured: boolean;
  is_active: boolean;
  original_price?: number; // Pricing for the service
  features: ServiceFeature[];
  created_by?: any | null;
  created_at?: string;
  updated_at?: string;
}

export const listServices = (params?: {
  is_active?: boolean;
  is_featured?: boolean;
  department?: number;
}) => api.get<Service[]>('/api/public/services/', { params });

export const getService = (id: number) => api.get<Service>(`/api/services/${id}/`);
export const getServiceBySlug = (slug: string) => api.get<Service>(`/api/services/slug/${slug}/`);
export const createService = (data: Partial<Service>) => api.post('/api/services/', data);
export const updateService = (id: number, data: Partial<Service>) => api.put(`/api/services/${id}/`, data);
export const deleteService = (id: number) => api.delete(`/api/services/${id}/`);