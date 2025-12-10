// frontend/src/api/notifications.ts
import api from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'order_update' | 'task_assigned' | 'payment_received' | 'message' | 'system';
  is_read: boolean;
  order?: number;
  task?: number;
  created_at: string;
  read_at?: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkAllReadResponse {
  message: string;
  count: number;
}

// Get all notifications for current user
export const getNotifications = async (params?: { is_read?: boolean; type?: string }) => {
  const response = await api.get<Notification[]>('/api/notifications/', { params });
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  const response = await api.get<UnreadCountResponse>('/api/notifications/unread_count/');
  return response.data;
};

// Mark single notification as read
export const markAsRead = async (id: number) => {
  const response = await api.post<Notification>(`/api/notifications/${id}/mark_read/`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.post<MarkAllReadResponse>('/api/notifications/mark_all_read/');
  return response.data;
};

// Create a new notification (admin only)
export const createNotification = async (data: {
  title: string;
  message: string;
  notification_type: string;
  order?: number;
  task?: number;
}) => {
  const response = await api.post<Notification>('/api/notifications/', data);
  return response.data;
};
