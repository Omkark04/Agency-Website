import api from './api';

export interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  short_description: string;
  discount_percent: number;
  discount_percentage: number;  // Alias for compatibility
  discount_code?: string;
  valid_from: string;
  valid_to: string;
  valid_until: string;  // Alias for compatibility
  is_active: boolean;
  is_featured: boolean;
  is_limited_time: boolean;
  icon_name: string;
  gradient_colors: string;
  button_text: string;
  button_url?: string;
  order_index: number;
  features: string[];
  conditions?: string[];
  remaining_days: number;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface LimitedTimeDeal {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  discount_percentage: number;
  original_price?: number;
  discounted_price?: number;
  valid_until: string;
  remaining_days: number;
  is_active: boolean;
  features: string[];
  button_text: string;
  button_url?: string;
}

// API Functions
export const listOffers = (params?: {
  is_active?: boolean;
  is_featured?: boolean;
  is_limited_time?: boolean;
}) => api.get<SpecialOffer[]>('/api/offers/', { params });

export const getOffer = (id: number) => 
  api.get<SpecialOffer>(`/api/offers/${id}/`);

export const createOffer = (data: Partial<SpecialOffer>) => 
  api.post<SpecialOffer>('/api/offers/', data);

export const updateOffer = (id: number, data: Partial<SpecialOffer>) => 
  api.put<SpecialOffer>(`/api/offers/${id}/`, data);

export const deleteOffer = (id: number) => 
  api.delete(`/api/offers/${id}/`);

export const getOfferStats = () =>
  api.get<{
    active_offers: number;
    limited_time_offers: number;
    average_discount: number;
  }>('/api/offers/stats/');

export const getCurrentDeal = () => 
  api.get<LimitedTimeDeal>('/api/offers/current-deal/');

// For backward compatibility
export const listSpecialOffers = listOffers;