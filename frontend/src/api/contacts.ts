import api from './api';

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  service?: number;
  service_title?: string;
  message: string;
  created_at: string;
  is_contacted: boolean;
}

export const listContacts = (params?: {
  is_contacted?: boolean;
  search?: string;
}) => api.get<ContactSubmission[]>('/api/contacts/', { params });

export const getContact = (id: number) => 
  api.get<ContactSubmission>(`/api/contacts/${id}/`);

export const updateContact = (id: number, data: Partial<ContactSubmission>) => 
  api.put(`/api/contacts/${id}/`, data);

export const deleteContact = (id: number) => 
  api.delete(`/api/contacts/${id}/`);

export const markContacted = (id: number) => 
  api.post(`/api/contacts/${id}/mark_contacted/`);

export const markUncontacted = (id: number) => 
  api.post(`/api/contacts/${id}/mark_uncontacted/`);

export const submitContact = (data: {
  name: string;
  email: string;
  phone?: string;
  service_id?: number;
  message: string;
}) => api.post('/api/contact/submit/', data);
