// frontend/src/api/cloudinary.ts
import api from './api';

export interface CloudinaryResource {
  public_id: string;
  format: string;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  url: string;
  secure_url: string;
  tags?: string[];
  context?: Record<string, any>;
  folder?: string;
}

export interface CloudinaryFolder {
  name: string;
  path: string;
}

export const listCloudinaryResources = (params?: {
  resource_type?: 'image' | 'video' | 'raw';
  folder?: string;
  max_results?: number;
}) => 
  api.get<{ resources: CloudinaryResource[]; total_count: number; next_cursor?: string }>(
    '/api/cloudinary-media/resources/',
    { params }
  );

export const deleteCloudinaryResource = (publicId: string, resourceType: string = 'image') =>
  api.delete(`/api/cloudinary-media/resources/${encodeURIComponent(publicId)}/`, {
    params: { resource_type: resourceType }
  });

export const updateCloudinaryResource = (
  publicId: string,
  data: { tags?: string[]; context?: Record<string, any> }
) =>
  api.patch(`/api/cloudinary-media/resources/${encodeURIComponent(publicId)}/update/`, data);

export const getCloudinaryFolders = () =>
  api.get<{ folders: CloudinaryFolder[] }>('/api/cloudinary-media/folders/');

// Helper to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Helper to get thumbnail URL
export const getThumbnailUrl = (resource: CloudinaryResource, width: number = 300): string => {
  if (resource.resource_type === 'image') {
    return resource.secure_url.replace('/upload/', `/upload/w_${width},c_fill/`);
  }
  return resource.secure_url;
};
