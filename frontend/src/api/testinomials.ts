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

export interface TestimonialAdmin extends Testimonial {
  email?: string;
  phone: string;
  consent_to_display: boolean;
  service?: number;
}

export interface TestimonialSubmission {
  client_name: string;
  client_role?: string;
  client_company?: string;
  content: string;
  rating: number;
  email?: string;
  phone: string;
  project_type?: string;
  service?: number;
  consent_to_display: boolean;
}

// Public API - for landing page
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

// Admin API - for dashboard
export const getAllTestimonials = (params?: {
  is_approved?: boolean;
  is_featured?: boolean;
}) => api.get<TestimonialAdmin[]>('/api/testimonials/', { params });

export const getTestimonial = (id: number) =>
  api.get<TestimonialAdmin>(`/api/testimonials/${id}/`);

export const updateTestimonial = (id: number, data: Partial<TestimonialAdmin>) =>
  api.put(`/api/testimonials/${id}/`, data);

export const deleteTestimonial = (id: number) =>
  api.delete(`/api/testimonials/${id}/`);

export const approveTestimonial = (id: number) =>
  api.post(`/api/testimonials/${id}/approve/`);

export const rejectTestimonial = (id: number) =>
  api.post(`/api/testimonials/${id}/reject/`);

export const toggleFeaturedTestimonial = (id: number) =>
  api.post(`/api/testimonials/${id}/toggle_featured/`);