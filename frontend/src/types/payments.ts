// frontend/src/types/payments.ts

export interface PaymentOrder {
  id: number;
  order: number;
  order_title: string;
  user: number;
  client_email: string;
  gateway: 'razorpay' | 'paypal';
  gateway_order_id: string;
  amount: string;
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'failed' | 'expired';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface Transaction {
  id: number;
  order: number;
  order_title: string;
  user: number;
  client_email: string;
  payment_order?: number;
  gateway: 'razorpay' | 'paypal';
  transaction_id: string;
  signature?: string;
  is_verified: boolean;
  amount: string;
  currency: string;
  payment_method?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  status_display?: string;
  error_code?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  can_retry: boolean;
  refund_amount?: string;
  refund_reason?: string;
  refunded_at?: string;
  receipt_pdf_url?: string;
  receipt_pdf_dropbox_path?: string;
  gateway_response?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  gateway_display?: string;
  payment_method_display?: string;
}

export interface PaymentOrderCreateData {
  order_id: number;
  gateway: 'razorpay' | 'paypal';
  currency: string;
  amount?: number;  // Optional: for partial payments (payment requests)
}

export interface PaymentVerificationData {
  gateway: 'razorpay' | 'paypal';
  // Razorpay fields
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  // PayPal fields
  paypal_payment_id?: string;
  paypal_payer_id?: string;
}

export interface RazorpayCheckoutData {
  payment_order_id: number;
  gateway: 'razorpay';
  gateway_order_id: string;
  amount: string;
  currency: string;
  razorpay_key: string;
  order_details: {
    id: number;
    title: string;
    description?: string;
  };
  customer: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface PayPalCheckoutData {
  payment_order_id: number;
  gateway: 'paypal';
  gateway_order_id: string;
  amount: string;
  currency: string;
  approval_url: string;
  order_details: {
    id: number;
    title: string;
    description?: string;
  };
}
