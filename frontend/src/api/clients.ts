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

export const listFeaturedClients = () => 
  api.get<Client[]>('/api/clients/featured/');

export const getCompanyStats = () => 
  api.get<CompanyStat[]>('/api/company-stats/');