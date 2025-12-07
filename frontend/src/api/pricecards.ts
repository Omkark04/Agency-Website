import api from './api';

export interface PriceCard {
  id: number;
  title: 'basic' | 'medium' | 'premium';
  department: number;
  service: number;
  price: string;
  revisions: number;
  description?: string;
  features?: string[]; // JSON field
  delivery_days?: number;
  is_active: boolean;
  created_at?: string;
}

export const listPriceCards = (params?: any) => api.get<PriceCard[]>('/api/price-cards/', { params });
export const getPriceCard = (id: number) => api.get<PriceCard>(`/api/price-cards/${id}/`);
export const createPriceCard = (data: Partial<PriceCard>) => api.post('/api/price-cards/', data);
export const updatePriceCard = (id: number, data: Partial<PriceCard>) => api.put(`/api/price-cards/${id}/`, data);
export const deletePriceCard = (id: number) => api.delete(`/api/price-cards/${id}/`);
