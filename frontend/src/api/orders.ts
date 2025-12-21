import api from './api';

export interface Order {
  id: number;
  client_id: number;
  service_id: number;
  pricing_plan_id?: number | null;
  title: string;
  details?: string;
  price: string;
  total_price?: number; // Added for OrdersPage compatibility
  service_title?: string; // Added for OrdersPage compatibility
  status: string;
  due_date?: string;
  created_at?: string;
}

export const listOrders = (params?: any) => api.get<Order[]>('/api/orders/', { params });
export const getOrder = (id: number) => api.get<Order>(`/api/orders/${id}/`);
export const updateOrder = (id: number, data: Partial<Order>) => api.put(`/api/orders/${id}/`, data);
export const deleteOrder = (id: number) => api.delete(`/api/orders/${id}/`);
