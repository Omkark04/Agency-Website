// services/api/clients.ts
import api from './api';

export interface Client {
  id: number;
  name: string;
  logo_url: string;
  website?: string;
  industry?: string;
  testimonial_count: number;
  projects_completed: number;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface CompanyStat {
  id: number;
  title: string;
  value: string;
  icon_name: string;
  description?: string;
  is_active: boolean;
  order_index: number;
}

// Object format returned by API
export interface CompanyStatsResponse {
  total_projects: number;
  total_services: number;
  total_clients: number;
  total_testimonials: number;
  success_rate: number;
  satisfaction_rate: number;
  years_experience: number;
  team_members: number;
}

export const listFeaturedClients = () => 
  api.get<Client[]>('/api/clients/featured/');

// API can return either array of CompanyStat or CompanyStatsResponse object
export const getCompanyStats = () => 
  api.get<CompanyStat[] | CompanyStatsResponse>('/api/company-stats/');