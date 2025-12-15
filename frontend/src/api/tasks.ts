// frontend/src/api/tasks.ts
import api from './api';
import type { Task, TaskAttachment, TaskCreateData } from '../types/task';

// Get all tasks for an order
export const getOrderTasks = (orderId: number, status?: string) => {
  const params = status ? { status } : {};
  return api.get<Task[]>(`/api/orders/${orderId}/tasks/`, { params });
};

// Create a new task
export const createTask = (orderId: number, data: TaskCreateData) =>
  api.post<Task>(`/api/orders/${orderId}/tasks/`, data);

// Get task details
export const getTask = (id: number) =>
  api.get<Task>(`/api/tasks/${id}/`);

// Update task
export const updateTask = (id: number, data: Partial<TaskCreateData>) =>
  api.put<Task>(`/api/tasks/${id}/`, data);

// Delete task
export const deleteTask = (id: number) =>
  api.delete(`/api/tasks/${id}/`);

// Upload task attachment
export const uploadTaskAttachment = (taskId: number, file: File, description?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  return api.post<{
    success: boolean;
    message: string;
    attachment: TaskAttachment;
  }>(`/api/tasks/${taskId}/upload-attachment/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Remove task attachment
export const removeTaskAttachment = (taskId: number, publicId: string) =>
  api.delete<{ success: boolean; message: string }>(
    `/api/tasks/${taskId}/remove-attachment/`,
    { data: { public_id: publicId } }
  );

// List all tasks (admin/service head)
export const listTasks = (params?: any) =>
  api.get<Task[]>('/api/tasks/', { params });
