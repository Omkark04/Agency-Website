// frontend/src/components/payments/PayPalCheckout.tsx
import React, { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { createPaymentOrder, verifyPayment } from '../../api/payments';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { PayPalCheckoutData } from '../../types/payments';

interface PayPalCheckoutProps {
  orderId: number;
  currency: string;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  orderId,
  currency,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState<string>('');
  const [checkoutData, setCheckoutData] = useState<PayPalCheckoutData | null>(null);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await createPaymentOrder({
        order_id: orderId,
        gateway: 'paypal',
        currency,
      });

      const data = response.data as PayPalCheckoutData;
      setCheckoutData(data);
      
      // Extract PayPal client ID from response or use environment variable
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
      setPaypalClientId(clientId);
      
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 'Failed to initiate payment';
      setError(errorMessage);
      if (onFailure) {
        onFailure(errorMessage);
      }
    }
  };

  const handleApprove = async (data: any) => {
    try {
      setLoading(true);
      
      // Verify payment on backend
      const verifyResponse = await verifyPayment({
        gateway: 'paypal',
        paypal_payment_id: data.orderID,
        paypal_payer_id: data.payerID,
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
      const errorMessage = err.response?.data?.error || 'Verification failed';
      setError(errorMessage);
      if (onFailure) {
        onFailure(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    const errorMessage = 'PayPal payment failed';
    setError(errorMessage);
    if (onFailure) {
      onFailure(errorMessage);
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

  if (!checkoutData) {
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
              Initializing PayPal...
            </>
          ) : (
            'Initialize PayPal Payment'
          )}
        </button>
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

      {paypalClientId && (
        <PayPalScriptProvider
          options={{
            clientId: paypalClientId,
            currency: currency,
          }}
        >
          <PayPalButtons
            createOrder={(data, actions) => {
              return Promise.resolve(checkoutData.gateway_order_id);
            }}
            onApprove={handleApprove}
            onError={handleError}
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
            }}
          />
        </PayPalScriptProvider>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Processing payment...</span>
        </div>
      )}
    </div>
  );
};

export default PayPalCheckout;
