// frontend/src/components/payments/PaymentHistory.tsx
import React, { useEffect, useState } from 'react';
import { getOrderTransactions, retryPayment } from '../../api/payments';
import { Transaction } from '../../types/payments';
import { RefreshCw, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentHistoryProps {
  orderId: number;
  onRetrySuccess?: () => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ orderId, onRetrySuccess }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [orderId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getOrderTransactions(orderId);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (transactionId: number) => {
    try {
      setRetrying(transactionId);
      await retryPayment(transactionId);
      await fetchTransactions();
      if (onRetrySuccess) {
        onRetrySuccess();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to retry payment');
    } finally {
      setRetrying(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      success: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="w-4 h-4" />,
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
      },
      refunded: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <RefreshCw className="w-4 h-4" />,
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="ml-1.5 capitalize">{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No payment transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        <button
          onClick={fetchTransactions}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.transaction_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="capitalize">{transaction.gateway}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.currency} {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.can_retry && transaction.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(transaction.id)}
                        disabled={retrying === transaction.id}
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center"
                      >
                        {retrying === transaction.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retry
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Messages */}
      {transactions.some(t => t.error_message) && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Error Details:</h4>
          {transactions
            .filter(t => t.error_message)
            .map(transaction => (
              <div key={transaction.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-900">
                  <span className="font-medium">Transaction {transaction.transaction_id}:</span>{' '}
                  {transaction.error_message}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
