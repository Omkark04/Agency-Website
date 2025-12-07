import api from './api';

export interface MediaItem {
  id: number;
  url: string;
  thumbnail_url?: string;
  media_type?: 'image'|'video';
  owner?: number;
  project?: number | null;
  service?: number | null;
  caption?: string;
  created_at?: string;
}

export const listMedia = (params?: any) => api.get<MediaItem[]>('/api/media/', { params });
export const uploadMedia = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return api.post('/api/upload/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const createMedia = (payload: Partial<MediaItem>) => api.post('/api/media/', payload);
export const deleteMedia = (id: number) => api.delete(`/api/media/${id}/`);
