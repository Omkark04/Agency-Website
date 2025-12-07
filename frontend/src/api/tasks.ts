import api from './api';

export interface Task {
  id: number;
  order_id: number;
  title: string;
  description?: string;
  assignee_id?: number | null;
  status?: string;
  priority?: number;
  due_date?: string;
  created_at?: string;
}

export const listTasks = (params?: any) => api.get<Task[]>('/api/tasks/', { params });
export const getTask = (id: number) => api.get<Task>(`/api/tasks/${id}/`);
export const createTask = (data: Partial<Task>) => api.post('/api/tasks/', data);
export const updateTask = (id: number, data: Partial<Task>) => api.put(`/api/tasks/${id}/`, data);
export const deleteTask = (id: number) => api.delete(`/api/tasks/${id}/`);
