// services/api/testimonials.ts
import api from './api';

export interface Testimonial {
  id: number;
  client_name: string;
  client_role: string;
  client_company: string;
  content: string;
  rating: number;
  avatar_url?: string;
  project_type?: string;
  service_id?: number;
  service_title?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TestimonialSubmission {
  client_name: string;
  client_role: string;
  client_company?: string;
  content: string;
  rating: number;
  email?: string;
  phone?: string;
  project_type?: string;
  service_id?: number;
  consent_to_display: boolean;
}

export const listTestimonials = (params?: {
  is_approved?: boolean;
  is_featured?: boolean;
  service_id?: number;
  limit?: number;
}) => api.get<Testimonial[]>('/api/testimonials/', { params });

export const createTestimonial = (data: TestimonialSubmission) => 
  api.post('/api/testimonials/', data);

export const getTestimonialStats = () => 
  api.get<{
    total: number;
    average_rating: number;
    featured_count: number;
    by_service: Array<{service_id: number; service_title: string; count: number}>;
  }>('/api/testimonials/stats/');