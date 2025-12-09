// services/api/offers.ts
import api from './api';

export interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  short_description: string;
  icon_name: string;
  features: string[];
  discount_percentage?: number;
  discount_code?: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  is_featured: boolean;
  is_limited_time: boolean;
  conditions?: string[];
  gradient_colors: string;
  button_text: string;
  button_url?: string;
  order_index: number;
  created_at: string;
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

export const listSpecialOffers = (params?: {
  is_active?: boolean;
  is_featured?: boolean;
  is_limited_time?: boolean;
}) => api.get<SpecialOffer[]>('/api/special-offers/', { params });

export const getCurrentDeal = () => 
  api.get<LimitedTimeDeal>('/api/offers/current-deal/');

export const getOfferStats = () =>
  api.get<{
    active_offers: number;
    limited_time_offers: number;
    average_discount: number;
  }>('/api/offers/stats/');