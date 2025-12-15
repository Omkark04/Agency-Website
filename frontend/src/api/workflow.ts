// frontend/src/api/workflow.ts
import api from './api';
import type { WorkflowInfo, OrderStatusHistory, StatusUpdateData, Deliverable } from '../types/workflow';

// Get workflow information for an order
export const getWorkflowInfo = (orderId: number) =>
  api.get<WorkflowInfo>(`/api/orders/${orderId}/workflow-info/`);

// Update order status
export const updateOrderStatus = (orderId: number, data: StatusUpdateData) =>
  api.post<{
    success: boolean;
    message: string;
    order: {
      id: number;
      status: string;
      status_display: string;
      status_updated_at: string;
      status_updated_by: string;
    };
  }>(`/api/orders/${orderId}/update-status/`, data);

// Get status history for an order
export const getStatusHistory = (orderId: number) =>
  api.get<{
    order_id: number;
    current_status: string;
    current_status_display: string;
    history: OrderStatusHistory[];
  }>(`/api/orders/${orderId}/status-history/`);

// Upload deliverable file
export const uploadDeliverable = (orderId: number, file: File, description?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  return api.post<{
    success: boolean;
    message: string;
    deliverable: Deliverable;
  }>(`/api/orders/${orderId}/upload-deliverable/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
