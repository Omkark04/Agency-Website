// frontend/src/components/payments/PaymentGatewaySelector.tsx
import React, { useState } from 'react';
import { CreditCard, DollarSign, Loader2 } from 'lucide-react';

interface PaymentGatewaySelectorProps {
  orderId: number;
  orderTitle: string;
  amount: string;
  onPaymentInitiated?: () => void;
  onPaymentSuccess?: () => void;
  onPaymentFailure?: (error: string) => void;
}

const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  orderId,
  orderTitle,
  amount,
  onPaymentInitiated,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'paypal'>('razorpay');
  const [currency, setCurrency] = useState<string>('INR');
  const [loading, setLoading] = useState(false);

  const handleGatewayChange = (gateway: 'razorpay' | 'paypal') => {
    setSelectedGateway(gateway);
    // Auto-set currency based on gateway
    if (gateway === 'razorpay') {
      setCurrency('INR');
    } else {
      setCurrency('USD');
    }
  };

  const handleProceedToPayment = () => {
    if (onPaymentInitiated) {
      onPaymentInitiated();
    }
    // This will be handled by parent component which will render
    // RazorpayCheckout or PayPalCheckout based on selection
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
        <p className="text-gray-600">Order: {orderTitle}</p>
      </div>

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">
              {currency === 'INR' ? '₹' : '$'} {amount}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-blue-500 opacity-50" />
        </div>
      </div>

      {/* Gateway Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Payment Method
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Razorpay Option */}
          <button
            onClick={() => handleGatewayChange('razorpay')}
            className={`relative flex items-center p-4 border-2 rounded-lg transition-all ${
              selectedGateway === 'razorpay'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-semibold text-gray-900">Razorpay</span>
              </div>
              <p className="text-xs text-gray-600">
                UPI, Cards, Net Banking, Wallets
              </p>
              <p className="text-xs text-blue-600 mt-1">For Indian Payments (INR)</p>
            </div>
            {selectedGateway === 'razorpay' && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* PayPal Option */}
          <button
            onClick={() => handleGatewayChange('paypal')}
            className={`relative flex items-center p-4 border-2 rounded-lg transition-all ${
              selectedGateway === 'paypal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-semibold text-gray-900">PayPal</span>
              </div>
              <p className="text-xs text-gray-600">
                PayPal Balance, Cards
              </p>
              <p className="text-xs text-blue-600 mt-1">For International Payments</p>
            </div>
            {selectedGateway === 'paypal' && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Currency Selection (for PayPal) */}
      {selectedGateway === 'paypal' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">Secure Payment</p>
            <p className="text-xs text-gray-600 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        onClick={handleProceedToPayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Payment
          </>
        )}
      </button>

      {/* Hidden data for parent component */}
      <input type="hidden" data-gateway={selectedGateway} data-currency={currency} />
    </div>
  );
};

export default PaymentGatewaySelector;
