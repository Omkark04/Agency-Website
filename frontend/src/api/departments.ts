import api from './api';

export interface Department {
  id: number;
  title: string;
  slug: string;
  logo?: string | null;
  short_description?: string;
  team_head?: number | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const requestCache = new Map<string, Promise<any>>();
const dataCache = new Map<string, CacheEntry<any>>();

const getCacheKey = (endpoint: string, params?: any): string => {
  return `${endpoint}${params ? JSON.stringify(params) : ''}`;
};

const isCacheValid = (entry: CacheEntry<any>): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

const cachedApiCall = async <T,>(
  endpoint: string,
  apiCall: () => Promise<{ data: T }>,
  params?: any
): Promise<{ data: T }> => {
  const cacheKey = getCacheKey(endpoint, params);

  const cachedData = dataCache.get(cacheKey);
  if (cachedData && isCacheValid(cachedData)) {
    return { data: cachedData.data };
  }

  const pendingRequest = requestCache.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = apiCall()
    .then((response) => {
      dataCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      requestCache.delete(cacheKey);
      return response;
    })
    .catch((error) => {
      requestCache.delete(cacheKey);
      throw error;
    });

  requestCache.set(cacheKey, request);
  return request;
};

export const listDepartments = (params?: { is_active?: boolean }) =>
  cachedApiCall<Department[]>(
    '/api/departments/',
    () => api.get<Department[]>('/api/departments/', { params }),
    params
  );

export const getDepartment = (id: number) =>
  cachedApiCall<Department>(
    `/api/departments/${id}/`,
    () => api.get<Department>(`/api/departments/${id}/`)
  );

export const createDepartment = (data: Partial<Department>) => {
  dataCache.clear();
  return api.post('/api/departments/', data);
};

export const updateDepartment = (id: number, data: Partial<Department>) => {
  dataCache.clear();
  return api.put(`/api/departments/${id}/`, data);
};

export const deleteDepartment = (id: number) => {
  dataCache.clear();
  return api.delete(`/api/departments/${id}/`);
};

export const clearDepartmentsCache = () => {
  dataCache.clear();
  requestCache.clear();
};
