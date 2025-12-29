import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { downloadReceipt, type PaymentRequest } from '../../api/payments';

interface PaymentRequestCardProps {
  paymentRequest: PaymentRequest;
  onPayNow: (paymentRequest: PaymentRequest) => void;
  onDownloadReceipt?: (transactionId: string) => void;
  loading?: boolean;
}

const PaymentRequestCard = ({
  paymentRequest,
  onPayNow,
  onDownloadReceipt,
  loading = false
}: PaymentRequestCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = () => {
    switch (paymentRequest.status) {
      case 'paid':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          text: 'text-green-700 dark:text-green-400',
          border: 'border-green-200 dark:border-green-700',
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'Paid'
        };
      case 'expired':
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          text: 'text-gray-700 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Expired'
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-200 dark:border-red-700',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Cancelled'
        };
      default: // pending
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
          text: 'text-yellow-700 dark:text-yellow-400',
          border: 'border-yellow-200 dark:border-yellow-700',
          icon: <Clock className="w-5 h-5" />,
          label: 'Pending'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isPending = paymentRequest.status === 'pending';
  const isPaid = paymentRequest.status === 'paid';
  const isExpired = paymentRequest.status === 'expired';

  // Check if expiring soon (within 24 hours)
  const isExpiringSoon = () => {
    if (!paymentRequest.expires_at || !isPending) return false;
    const expiresAt = new Date(paymentRequest.expires_at);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry < 24;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Payment Request
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                #{paymentRequest.id}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}>
            {statusConfig.icon}
            <span className={`text-sm font-bold ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Amount - Large and prominent */}
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-xl border border-orange-200 dark:border-orange-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Amount Due
          </p>
          <div className="flex items-baseline">
            <span className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              ₹{parseFloat(paymentRequest.amount).toLocaleString()}
            </span>
            <span className="ml-2 text-sm font-medium text-gray-500">
              {paymentRequest.currency}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {paymentRequest.order_title || `Order #${paymentRequest.order}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Requested by</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {paymentRequest.requested_by_email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(paymentRequest.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {paymentRequest.expires_at && !isPaid && (
            <div className="flex items-center space-x-3">
              <Clock className={`w-4 h-4 ${isExpiringSoon() ? 'text-red-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Expires</p>
                <p className={`text-sm font-semibold ${isExpiringSoon() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {new Date(paymentRequest.expires_at).toLocaleDateString()}
                  {isExpiringSoon() && (
                    <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Expiring Soon!)</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {paymentRequest.notes && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Notes
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {paymentRequest.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isPending && !isExpired && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPayNow(paymentRequest)}
              disabled={loading}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {loading ? 'Processing...' : 'Pay Now'}
            </motion.button>
          )}

          {isPaid && (paymentRequest.receipt_pdf_url || (onDownloadReceipt && paymentRequest.transaction_id)) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const url = paymentRequest.receipt_pdf_url;
                if (url && typeof url === 'string') {
                  let finalUrl = url;
                  // Force download if it's a Dropbox URL
                  if (finalUrl.includes('dropbox.com')) {
                    if (finalUrl.includes('?dl=0')) {
                      finalUrl = finalUrl.replace('?dl=0', '?dl=1');
                    } else if (!finalUrl.includes('?dl=1') && !finalUrl.includes('&dl=1')) {
                      finalUrl += finalUrl.includes('?') ? '&dl=1' : '?dl=1';
                    }
                  }
                  window.open(finalUrl, '_blank');
                } else if (paymentRequest.transaction_id) {
                  try {
                    const fetchedUrl = await downloadReceipt(paymentRequest.transaction_id);
                    let finalUrl = fetchedUrl;
                    if (finalUrl.includes('dropbox.com')) {
                        if (finalUrl.includes('?dl=0')) {
                          finalUrl = finalUrl.replace('?dl=0', '?dl=1');
                        } else if (!finalUrl.includes('?dl=1') && !finalUrl.includes('&dl=1')) {
                          finalUrl += finalUrl.includes('?') ? '&dl=1' : '?dl=1';
                        }
                    }
                    window.open(finalUrl, '_blank');
                  } catch (err) {
                    console.error("Failed to download receipt", err);
                  }
                } else if (onDownloadReceipt && paymentRequest.transaction_id) {
                   // Legacy Fallback if needed, but above covers it.
                   // onDownloadReceipt logic is likely obsolete if we handle it here, 
                   // but keeping it safe if onDownloadReceipt does something else.
                   // Actually onDownloadReceipt in parent probably just did what we are doing.
                   // Let's call it just in case if the above logic fails? 
                   // No, sticking to direct call is better.
                   onDownloadReceipt(paymentRequest.transaction_id);
                }
              }}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </motion.button>
          )}

          {isExpired && (
            <div className="flex-1 text-center py-3 px-6 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-gray-300 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                This payment request has expired
              </p>
            </div>
          )}
        </div>

        {/* Paid date */}
        {isPaid && paymentRequest.paid_at && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Paid on {new Date(paymentRequest.paid_at).toLocaleDateString()} at{' '}
              {new Date(paymentRequest.paid_at).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentRequestCard;
