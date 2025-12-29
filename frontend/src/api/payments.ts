// frontend/src/api/payments.ts
import api from './api';
import type { PaymentOrder } from '../types/payments';
import type { Transaction } from '../types/payments';
import type { PaymentOrderCreateData } from '../types/payments';
import type { PaymentVerificationData } from '../types/payments';
import type { RazorpayCheckoutData } from '../types/payments';
import type { PayPalCheckoutData } from '../types/payments';

// Create payment order
export const createPaymentOrder = (data: PaymentOrderCreateData) =>
  api.post<RazorpayCheckoutData | PayPalCheckoutData>('/api/payments/create-order/', data);

// Verify payment after completion
export const verifyPayment = (data: PaymentVerificationData) =>
  api.post<{ success: boolean; message: string; transaction: Transaction }>('/api/payments/verify/', data);

// Get all transactions for an order
export const getOrderTransactions = (orderId: number) =>
  api.get<Transaction[]>(`/api/payments/order/${orderId}/transactions/`);

// Retry a failed payment
export const retryPayment = (transactionId: number) =>
  api.post<{ success: boolean; message: string; payment_order: PaymentOrder }>(
    `/api/payments/retry/${transactionId}/`
  );

// Get payment order details
export const getPaymentOrder = (id: number) =>
  api.get<PaymentOrder>(`/api/payments/payment-orders/${id}/`);

// List all payment orders (admin/service head)
export const listPaymentOrders = (params?: any) =>
  api.get<PaymentOrder[]>('/api/payments/payment-orders/', { params });

// Payment Request APIs
export interface PaymentRequestData {
  order_id: number;
  amount: number;
  gateway: 'razorpay' | 'paypal';
  currency?: string;
  notes?: string;
}

export interface PaymentRequest {
  id: number;
  order: number;
  order_title: string;
  requested_by: number;
  requested_by_email: string;
  client_email: string;
  amount: string;
  gateway: string;
  currency: string;
  status: string;
  payment_link: string;
  notes: string;
  created_at: string;
  expires_at: string;
  paid_at: string | null;
  receipt_pdf_url?: string;
  transaction_id?: string;
}

// Create payment request (admin/service head only)
export const createPaymentRequest = (data: PaymentRequestData) =>
  api.post<{ success: boolean; message: string; payment_request: PaymentRequest }>(
    '/api/payments/request-payment/',
    data
  );

// List payment requests
export const listPaymentRequests = (params?: { status?: string }) =>
  api.get<PaymentRequest[]>('/api/payments/requests/', { params });

// Download receipt PDF
export const downloadReceipt = async (transactionId: string): Promise<string> => {
  const response = await api.get<{ url: string }>(`/api/payments/receipt/${transactionId}/`);
  return response.data.url;
};

// List user transactions
export const listTransactions = () =>
  api.get<Transaction[]>('/api/payments/transactions/');
