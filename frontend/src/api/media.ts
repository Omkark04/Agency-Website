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
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  public_id?: string;
}

export const listMedia = (params?: any) => api.get<MediaItem[]>('/api/media/', { params });
export const uploadMedia = (file: File, caption?: string) => {
  const data = new FormData();
  data.append('file', file);
  if (caption) {
    data.append('caption', caption);
  }
  return api.post('/api/upload/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const createMedia = (payload: Partial<MediaItem>) => api.post('/api/media/', payload);
export const deleteMedia = (id: number) => api.delete(`/api/media/${id}/`);

// Add these to your existing media.ts file
export const fetchHeroImages = async (): Promise<MediaItem[]> => {
  try {
    const response = await api.get<MediaItem[]>('/api/media/', {
      params: {
        caption__icontains: 'hero',
        media_type: 'image',
        ordering: '-created_at'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return [];
  }
};

export const uploadHeroImage = async (file: File, caption: string = 'Hero Image'): Promise<MediaItem> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('caption', caption);
  
  const response = await api.post<{ url: string; thumbnail_url?: string }>('/api/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Also create a media record
  const mediaData = {
    url: response.data.url,
    media_type: 'image' as const,
    caption: caption,
    thumbnail_url: response.data.thumbnail_url || response.data.url
  };
  
  const result = await createMedia(mediaData);
  return result.data;
};

export const fetchAboutImages = async (): Promise<MediaItem[]> => {
  try {
    const response = await api.get<MediaItem[]>('/api/media/', {
      params: {
        caption__icontains: 'about',
        media_type: 'image',
        ordering: '-created_at'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching about images:', error);
    return [];
  }
};