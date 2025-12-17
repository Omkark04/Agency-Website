import api from './api';

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  category: string;
  featured_image: string;
  gallery_images: string[];
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  read_time?: string;
}

export interface BlogCreateUpdate {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  gallery_images: string[];
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
}

export const listBlogs = (params?: {
  category?: string;
  is_featured?: boolean;
  is_published?: boolean;
  author?: number;
  search?: string;
  ordering?: string;
}) => api.get<Blog[]>('/api/blogs/', { params });

export const getBlog = (id: number) => api.get<Blog>(`/api/blogs/${id}/`);

export const getBlogBySlug = (slug: string) => 
  api.get<Blog[]>('/api/blogs/', { params: { search: slug } });

export const createBlog = (data: BlogCreateUpdate) => 
  api.post<Blog>('/api/blogs/', data);

export const updateBlog = (id: number, data: Partial<BlogCreateUpdate>) => 
  api.patch<Blog>(`/api/blogs/${id}/`, data);

export const deleteBlog = (id: number) => api.delete(`/api/blogs/${id}/`);

export const getFeaturedBlogs = () => api.get<Blog[]>('/api/blogs/featured/');

export const getBlogCategories = () => 
  api.get<{ categories: string[] }>('/api/blogs/categories/');

export const getMyBlogs = () => api.get<Blog[]>('/api/blogs/my_blogs/');

export const toggleBlogFeatured = (id: number) => 
  api.post<Blog>(`/api/blogs/${id}/toggle_featured/`);

export const toggleBlogPublish = (id: number) => 
  api.post<Blog>(`/api/blogs/${id}/toggle_publish/`);
