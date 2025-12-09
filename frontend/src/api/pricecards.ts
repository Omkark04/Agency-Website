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

export interface PricingPlan {
  id: number;
  title: string;
  description: string;
  price: string; // Could be "Custom" or "$499"
  price_numeric?: number; // For sorting and calculations
  billing_period?: 'monthly' | 'yearly' | 'one_time';
  is_popular: boolean;
  is_active: boolean;
  features: PricingFeature[];
  gradient_colors: string;
  button_text: string;
  service_id?: number;
  service_title?: string;
  order_index: number;
  created_at: string;
}

export interface PricingFeature {
  id: number;
  text: string;
  is_included: boolean;
  is_highlighted?: boolean;
  tooltip?: string;
}

export interface PricingComparison {
  id: number;
  feature: string;
  basic: string | boolean;
  growth: string | boolean;
  enterprise: string | boolean;
  is_important: boolean;
}

export const listPricingPlans = (params?: {
  is_active?: boolean;
  service_id?: number;
  is_popular?: boolean;
}) => api.get<PricingPlan[]>('/api/pricing-plans/', { params });

export const getPricingComparison = () => 
  api.get<PricingComparison[]>('/api/pricing/comparison/');

export const getPricingStats = () =>
  api.get<{
    total_plans: number;
    active_plans: number;
    popular_plans: number;
    average_price: number;
  }>('/api/pricing/stats/');