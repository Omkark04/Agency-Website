// frontend/src/api/invoices.ts
import api from './api';
import { Invoice, InvoiceGenerateData } from '../types/invoices';

// Generate invoice for an order
export const generateInvoice = (orderId: number, data: InvoiceGenerateData) =>
  api.post<{ success: boolean; message: string; invoice: Invoice }>(
    `/api/orders/${orderId}/invoices/generate/`,
    data
  );

// Get invoice details
export const getInvoice = (invoiceId: number) =>
  api.get<Invoice>(`/api/invoices/${invoiceId}/`);

// Update invoice
export const updateInvoice = (invoiceId: number, data: Partial<Invoice>) =>
  api.put<Invoice>(`/api/invoices/${invoiceId}/`, data);

// Delete invoice
export const deleteInvoice = (invoiceId: number) =>
  api.delete(`/api/invoices/${invoiceId}/`);

// Download invoice PDF
export const downloadInvoice = (invoiceId: number) =>
  api.get<{ pdf_url: string; invoice_number: string }>(`/api/invoices/${invoiceId}/download/`);

// List all invoices (admin/service head)
export const listInvoices = (params?: any) =>
  api.get<Invoice[]>('/api/invoices/', { params });
