import api from './api';

export const listPortfolios = () => api.get('/api/portfolio/');
export const createPortfolio = (data: any) => api.post('/api/portfolio/', data);
export const updatePortfolio = (id: number, data: any) => api.put(`/api/portfolio/${id}/`, data);
export const deletePortfolio = (id: number) => api.delete(`/api/portfolio/${id}/`);


export interface CaseStudy {
  id: number;
  title: string;
  slug?: string;
  description: string;
  full_description?: string;
  client_name: string;
  client_logo?: string;
  category: string;
  service_id?: number;
  service_title?: string;
  featured_image: string;
  gallery_images?: string[];
  technologies: string[];
  duration: string;
  results: string;
  metrics: {
    value: string;
    label: string;
    change?: string;
  }[];
  challenges: string[];
  solutions: string[];
  testimonial_id?: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

export const listCaseStudies = (params?: {
  is_published?: boolean;
  is_featured?: boolean;
  category?: string;
  service_id?: number;
  limit?: number;
}) => api.get<CaseStudy[]>('/api/case-studies/', { params });

export const getCaseStudy = (id: number) => api.get<CaseStudy>(`/api/case-studies/${id}/`);
export const getCaseStudyBySlug = (slug: string) => api.get<CaseStudy>(`/api/case-studies/slug/${slug}/`);
export const getCaseStudyStats = () => 
  api.get<{
    total: number;
    featured: number;
    by_category: Array<{category: string; count: number}>;
    by_service: Array<{service_id: number; service_title: string; count: number}>;
  }>('/api/case-studies/stats/');


export interface PortfolioProject {
  id: number;
  title: string;
  slug: string;
  description: string;
  service?: {
    id: number;
    name: string;
    icon?: string;
  };
  client_name: string;
  created_by?: {
    id: number;
    username: string;
    email: string;
  };
  is_featured: boolean;
  featured_image: string;
  images: string[];
  video?: string;
  created_at: string;
}

export const fetchPortfolioProjects = async (params?: {
  is_featured?: boolean;
  service?: number;
  limit?: number;
}): Promise<PortfolioProject[]> => {
  try {
    const response = await api.get('/api/portfolio/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio projects:', error);
    return [];
  }
};

export const fetchFeaturedPortfolioProjects = async (limit: number = 6): Promise<PortfolioProject[]> => {
  return fetchPortfolioProjects({ is_featured: true, limit });
};

export const createPortfolioProject = async (data: FormData): Promise<PortfolioProject> => {
  const response = await api.post('/api/portfolio/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePortfolioProject = async (id: number, data: FormData): Promise<PortfolioProject> => {
  const response = await api.put(`/api/portfolio/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePortfolioProject = async (id: number): Promise<void> => {
  await api.delete(`/api/portfolio/${id}/`);
};