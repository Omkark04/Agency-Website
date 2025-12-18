// frontend/src/api/googleAnalytics.ts
import api from './api';

export interface GA4RealtimeData {
  active_users: number;
  timestamp: string;
  error?: string;
}

export interface GA4OverviewData {
  overview: {
    total_users: number;
    sessions: number;
    avg_session_duration: number;
    bounce_rate: number;
    page_views: number;
    period_days: number;
  };
  trend: Array<{
    date: string;
    page_views: number;
  }>;
}

export interface GA4Page {
  page_path: string;
  page_title: string;
  page_views: number;
  avg_time: number;
  bounce_rate: number;
}

export interface GA4Source {
  source: string;
  sessions: number;
  users: number;
}

export interface GA4Device {
  device: string;
  sessions: number;
  users: number;
}

export interface GA4Demographics {
  countries: Array<{
    country: string;
    users: number;
  }>;
}

/**
 * Get real-time active users
 */
export const getGA4Realtime = async (): Promise<GA4RealtimeData> => {
  const response = await api.get<GA4RealtimeData>('/api/analytics/ga4/realtime/');
  return response.data;
};

/**
 * Get overview metrics and trend
 */
export const getGA4Overview = async (days: number = 7): Promise<GA4OverviewData> => {
  const response = await api.get<GA4OverviewData>(`/api/analytics/ga4/overview/?days=${days}`);
  return response.data;
};

/**
 * Get top pages
 */
export const getGA4Pages = async (days: number = 7, limit: number = 10): Promise<{ pages: GA4Page[] }> => {
  const response = await api.get(`/api/analytics/ga4/pages/?days=${days}&limit=${limit}`);
  return response.data;
};

/**
 * Get traffic sources
 */
export const getGA4Sources = async (days: number = 7): Promise<{ sources: GA4Source[] }> => {
  const response = await api.get(`/api/analytics/ga4/sources/?days=${days}`);
  return response.data;
};

/**
 * Get device breakdown
 */
export const getGA4Devices = async (days: number = 7): Promise<{ devices: GA4Device[] }> => {
  const response = await api.get(`/api/analytics/ga4/devices/?days=${days}`);
  return response.data;
};

/**
 * Get user demographics
 */
export const getGA4Demographics = async (days: number = 7): Promise<GA4Demographics> => {
  const response = await api.get<GA4Demographics>(`/api/analytics/ga4/demographics/?days=${days}`);
  return response.data;
};
