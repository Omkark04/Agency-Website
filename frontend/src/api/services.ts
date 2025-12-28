import api from './api';

export interface ServiceFeature {
  id: number;
  title: string;
  description?: string;
  order_index: number;
}

export interface Service {
  id: number;
  title: string;
  slug?: string;
  logo?: string | null;
  short_description: string;
  long_description?: string;
  department: number;
  department_title?: string;
  icon_name: 'palette' | 'laptop-code' | 'graduation-cap' | 'megaphone' | 'chart-line' | 'code' | 'mobile' | 'brush';
  gradient_colors: string; // e.g., "from-[#00C2A8] to-[#00A5C2]"
  is_featured: boolean;
  is_active: boolean;
  original_price?: number; // Pricing for the service
  features: ServiceFeature[];
  created_by?: any | null;
  created_at?: string;
  updated_at?: string;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Request cache to prevent duplicate concurrent requests
const requestCache = new Map<string, Promise<any>>();
// Data cache to store API responses
const dataCache = new Map<string, CacheEntry<any>>();

// Helper function to create cache key
const getCacheKey = (endpoint: string, params?: any): string => {
  return `${endpoint}${params ? JSON.stringify(params) : ''}`;
};

// Helper function to check if cache is valid
const isCacheValid = (entry: CacheEntry<any>): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

// Cached API call wrapper
const cachedApiCall = async <T,>(
  endpoint: string,
  apiCall: () => Promise<{ data: T }>,
  params?: any
): Promise<{ data: T }> => {
  const cacheKey = getCacheKey(endpoint, params);

  // Check data cache first
  const cachedData = dataCache.get(cacheKey);
  if (cachedData && isCacheValid(cachedData)) {
    return { data: cachedData.data };
  }

  // Check if request is already in progress
  const pendingRequest = requestCache.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  // Make new request
  const request = apiCall()
    .then((response) => {
      // Store in data cache
      dataCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      // Remove from request cache
      requestCache.delete(cacheKey);
      return response;
    })
    .catch((error) => {
      // Remove from request cache on error
      requestCache.delete(cacheKey);
      throw error;
    });

  // Store in request cache
  requestCache.set(cacheKey, request);
  return request;
};

export const listServices = (params?: {
  is_active?: boolean;
  is_featured?: boolean;
  department?: number;
}) => cachedApiCall<Service[]>(
  '/api/public/services/',
  () => api.get<Service[]>('/api/public/services/', { params }),
  params
);

export const getService = (id: number) => 
  cachedApiCall<Service>(
    `/api/services/${id}/`,
    () => api.get<Service>(`/api/services/${id}/`)
  );

export const getServiceBySlug = (slug: string) => 
  cachedApiCall<Service>(
    `/api/services/slug/${slug}/`,
    () => api.get<Service>(`/api/services/slug/${slug}/`)
  );

// These mutations should not be cached
export const createService = (data: Partial<Service>) => {
  // Clear cache on create
  dataCache.clear();
  return api.post('/api/services/', data);
};

export const updateService = (id: number, data: Partial<Service>) => {
  // Clear cache on update
  dataCache.clear();
  return api.put(`/api/services/${id}/`, data);
};

export const deleteService = (id: number) => {
  // Clear cache on delete
  dataCache.clear();
  return api.delete(`/api/services/${id}/`);
};

// Export function to manually clear cache if needed
export const clearServicesCache = () => {
  dataCache.clear();
  requestCache.clear();
};