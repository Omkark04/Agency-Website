import api from './api';

// Types
export interface FormField {
  id?: number;
  form?: number;
  label: string;
  field_type: 'text' | 'number' | 'short_text' | 'long_text' | 'dropdown' | 'checkbox' | 'multi_select' | 'media';
  required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: string[];
  order: number;
}

export interface ServiceForm {
  id?: number;
  service: number;
  service_title?: string;
  title: string;
  description: string;
  is_active: boolean;
  created_by?: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
  fields?: FormField[];
}

export interface FormSubmission {
  id?: number;
  form: number;
  form_title?: string;
  service: number;
  service_title?: string;
  submitted_by?: number;
  submitted_by_name?: string;
  client_email?: string;
  data: Record<string, any>;
  files: Record<string, string[]>;
  submission_summary?: string;
  order?: number;
  order_id?: number;
  created_at?: string;
}

// Form CRUD
export const listForms = (params?: any) => 
  api.get<ServiceForm[]>('/api/forms/', { params });

export const getForm = (id: number) => 
  api.get<ServiceForm>(`/api/forms/${id}/`);

export const getFormByService = (serviceId: number) => 
  api.get<ServiceForm>(`/api/forms/by_service/`, { params: { service_id: serviceId } });

export const createForm = (data: Partial<ServiceForm>) => 
  api.post<ServiceForm>('/api/forms/', data);

export const updateForm = (id: number, data: Partial<ServiceForm>) => 
  api.put<ServiceForm>(`/api/forms/${id}/`, data);

export const deleteForm = (id: number) => 
  api.delete(`/api/forms/${id}/`);

// Field CRUD
export const createField = (data: Partial<FormField>) => 
  api.post<FormField>('/api/form-fields/', data);

export const updateField = (id: number, data: Partial<FormField>) => 
  api.put<FormField>(`/api/form-fields/${id}/`, data);

export const deleteField = (id: number) => 
  api.delete(`/api/form-fields/${id}/`);

// Submissions
export const listSubmissions = (params?: any) => 
  api.get<FormSubmission[]>('/api/form-submissions/', { params });

export const getSubmission = (id: number) => 
  api.get<FormSubmission>(`/api/form-submissions/${id}/`);

export const submitForm = (formId: number, data: {
  data: Record<string, any>;
  files?: Record<string, string[]>;
  client_email?: string;
}) => {
  return api.post(`/api/forms/${formId}/submit/`, data);
};

export const submitFormMultipart = (formId: number, formData: FormData) => {
  return api.post(`/api/forms/${formId}/submit/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
