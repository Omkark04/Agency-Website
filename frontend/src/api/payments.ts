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
