// frontend/src/components/payments/RazorpayCheckout.tsx
import React, { useEffect, useState } from 'react';
import { createPaymentOrder, verifyPayment } from '../../api/payments';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { RazorpayCheckoutData } from '../../types/payments';

interface RazorpayCheckoutProps {
  orderId: number;
  currency: string;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  orderId,
  currency,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create payment order
      const response = await createPaymentOrder({
        order_id: orderId,
        gateway: 'razorpay',
        currency,
      });

      const checkoutData = response.data as RazorpayCheckoutData;

      // Configure Razorpay options
      const options = {
        key: checkoutData.razorpay_key,
        amount: parseFloat(checkoutData.amount) * 100, // Convert to paise
        currency: checkoutData.currency,
        name: 'Your Company Name',
        description: checkoutData.order_details.title,
        order_id: checkoutData.gateway_order_id,
        prefill: {
          name: checkoutData.customer.name,
          email: checkoutData.customer.email,
          contact: checkoutData.customer.contact,
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async function (response: any) {
          // Payment successful, verify on backend
          try {
            const verifyResponse = await verifyPayment({
              gateway: 'razorpay',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              setSuccess(true);
              if (onSuccess) {
                onSuccess();
              }
            } else {
              setError('Payment verification failed');
              if (onFailure) {
                onFailure('Payment verification failed');
              }
            }
          } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed');
            if (onFailure) {
              onFailure(err.response?.data?.error || 'Verification failed');
            }
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
            if (onFailure) {
              onFailure('Payment cancelled');
            }
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 'Failed to initiate payment';
      setError(errorMessage);
      if (onFailure) {
        onFailure(errorMessage);
      }
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900 mb-2">Payment Successful!</h3>
        <p className="text-green-700">Your payment has been processed successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">Payment Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={initiatePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay with Razorpay'
        )}
      </button>
    </div>
  );
};

export default RazorpayCheckout;
