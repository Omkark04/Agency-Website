// frontend/src/api/estimations.ts
import api from './api';
import type { Estimation, EstimationCreateData } from '../types/estimations';

// Get all estimations for an order
export const getOrderEstimations = (orderId: number) =>
  api.get<Estimation[]>(`/api/orders/${orderId}/estimations/`);

// Create a new estimation
export const createEstimation = (orderId: number, data: EstimationCreateData) =>
  api.post<Estimation>(`/api/orders/${orderId}/estimations/`, data);

// Get estimation details
export const getEstimation = (estimationId: number) =>
  api.get<Estimation>(`/api/estimations/${estimationId}/`);

// Update estimation
export const updateEstimation = (estimationId: number, data: Partial<EstimationCreateData>) =>
  api.put<Estimation>(`/api/estimations/${estimationId}/`, data);

// Delete estimation
export const deleteEstimation = (estimationId: number) =>
  api.delete(`/api/estimations/${estimationId}/`);

// Generate PDF for estimation
export const generateEstimationPDF = (estimationId: number) =>
  api.post<{ success: boolean; message: string; pdf_url: string; pdf_public_id: string }>(
    `/api/orders/estimations/${estimationId}/generate-pdf/`
  );

// Send estimation to client
export const sendEstimation = (estimationId: number) =>
  api.post<{ success: boolean; message: string; estimation: Estimation }>(
    `/api/orders/estimations/${estimationId}/send/`
  );

// List all estimations (admin/service head)
export const listEstimations = (params?: any) =>
  api.get<Estimation[]>('/api/orders/estimations/', { params });
