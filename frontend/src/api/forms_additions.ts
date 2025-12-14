// frontend/src/api/forms.ts
import apiClient from './api';

export const getServiceForm = (serviceId: number) => {
  return apiClient.get(`/api/services/${serviceId}/form/`);
};

export const submitServiceForm = (data: any) => {
  return apiClient.post('/api/forms/submit/', data);
};

export const listSubmissions = () => {
  return apiClient.get('/api/forms/submissions/');
};
