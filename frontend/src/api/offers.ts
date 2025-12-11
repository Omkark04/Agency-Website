import api from './api';

export interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  short_description: string;
  image?: string;
  
  offer_type: 'seasonal' | 'limited' | 'bundle' | 'launch';
  original_price?: number;
  discounted_price?: number;
  
  discount_type: 'percent' | 'flat';
  discount_value: number;
  discount_percent?: number;  // For compatibility
  discount_percentage?: number;  // For compatibility
  
  discount_code?: string;
  terms?: string;
  
  valid_from: string;
  valid_to: string;
  valid_until: string;  // Alias for compatibility
  
  is_active: boolean;
  is_featured: boolean;
  is_limited_time?: boolean;  // For compatibility
  priority: number;
  
  cta_text: string;
  cta_link?: string;
  
  // Design fields
  icon_name: string;
  gradient_colors: string;
  button_text: string;
  button_url?: string;
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
  cta_text: string;
  cta_link?: string;
  image?: string;
}

// API Functions
export const listOffers = (params?: {
  is_active?: boolean;
  is_featured?: boolean;
  is_limited_time?: boolean;
  offer_type?: string;
  show_expired?: boolean;
}) => api.get<SpecialOffer[]>('/api/offers/', { params });

export const getOffer = (id: number) => 
  api.get<SpecialOffer>(`/api/offers/${id}/`);

export const createOffer = (data: FormData) => 
  api.post<SpecialOffer>('/api/offers/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const updateOffer = (id: number, data: FormData) => 
  api.put<SpecialOffer>(`/api/offers/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

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

// Helper function to prepare form data
export const prepareOfferFormData = (offer: Partial<SpecialOffer>, imageFile?: File): FormData => {
  const formData = new FormData();
  
  // Add all fields to form data
  Object.entries(offer).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle array fields
        value.forEach((item) => {
          if (typeof item === 'string') {
            formData.append(`${key}`, item);
          }
        });
      } else if (typeof value === 'object' && value !== null && !('lastModified' in value && 'name' in value && 'size' in value)) {
        // Skip objects (except files - check for File-like properties)
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  return formData;
};

// For backward compatibility
export const listSpecialOffers = listOffers;