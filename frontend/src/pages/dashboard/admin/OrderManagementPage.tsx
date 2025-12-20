import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  PaymentGatewaySelector,
  PaymentHistory,
  EstimationBuilder,
  EstimationList,
  InvoiceGenerator,
  InvoiceList,
  TaskManager,
  TaskCreateModal,
  StatusTimeline,
  StatusUpdateModal,
  DeliverableUpload
} from '@/components';
import { getWorkflowInfo, updateOrderStatus } from '@/api/workflow';
import { getOrder } from '../../../api/orders';
import { createPaymentRequest } from '../../../api/payments';
import type { WorkflowInfo } from '@/types/workflow';
import { FiCheckCircle, FiX, FiAlertCircle, FiDollarSign, FiEdit } from 'react-icons/fi';

export default function OrderManagementPage() {
  const { orderId } = useParams();
  const [workflowInfo, setWorkflowInfo] = useState<WorkflowInfo | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEstimationBuilder, setShowEstimationBuilder] = useState(false);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReason, setPaymentReason] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'paypal'>('razorpay');

  useEffect(() => {
    if (orderId) {
      fetchWorkflowInfo();
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchWorkflowInfo = async () => {
    try {
      console.log('=== Fetching Workflow Info for Order ID:', orderId);
      const response = await getWorkflowInfo(parseInt(orderId!));
      console.log('=== Workflow Info Response:', response);
      console.log('=== Workflow Info Data:', response.data);
      console.log('=== Current Status Display:', response.data?.current_status_display);
      setWorkflowInfo(response.data);
    } catch (error: any) {
      console.error('=== Failed to fetch workflow info:', error);
      console.error('=== Error response:', error.response);
      console.error('=== Error status:', error.response?.status);
      console.error('=== Error data:', error.response?.data);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      console.log('=== Fetching Order Details for Order ID:', orderId);
      // Use API client instead of raw fetch
      const response = await getOrder(parseInt(orderId!));
      console.log('=== Order Details Response:', response);
      console.log('=== Order Details Data:', response.data);
      setOrder(response.data);
    } catch (error: any) {
      console.error('=== Failed to fetch order details:', error);
      console.error('=== Error response:', error.response);
      console.error('=== Error status:', error.response?.status);
      console.error('=== Error data:', error.response?.data);
    }
  };

  const handleApproveOrder = async () => {
    try {
      await updateOrderStatus(parseInt(orderId!), {
        new_status: 'approved',
        notes: 'Order approved by admin'
      });
      alert('Order approved successfully!');
      fetchWorkflowInfo();
    } catch (error) {
      console.error('Failed to approve order:', error);
      alert('Failed to approve order');
    }
  };

  const handleRejectOrder = async () => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await updateOrderStatus(parseInt(orderId!), {
          new_status: 'closed' as any, // Using 'closed' instead of 'cancelled' as per workflow
          notes: `Order rejected: ${reason}`
        });
        alert('Order rejected');
        fetchWorkflowInfo();
      } catch (error) {
        console.error('Failed to reject order:', error);
        alert('Failed to reject order');
      }
    }
  };

  const handleRequestPartialPayment = async () => {
    try {
      const amount = parseFloat(paymentAmount);
      const remaining = (order?.price || 0) - (order?.total_paid || 0);
      
      if (amount <= 0 || amount > remaining) {
        alert(`Please enter a valid amount between ₹1 and ₹${remaining}`);
        return;
      }
      
      // Create payment request using new API
      await createPaymentRequest({
        order_id: parseInt(orderId!),
        amount: amount,
        gateway: paymentGateway,
        currency: 'INR',
        notes: paymentReason || `Payment request for ${workflowInfo?.current_status_display}`
      });
      
      alert('Payment request sent to client! They will receive an email with payment link.');
      setShowPaymentRequestModal(false);
      setPaymentAmount('');
      setPaymentReason('');
      setPaymentGateway('razorpay');
      fetchWorkflowInfo();
      fetchOrderDetails();
    } catch (error: any) {
      console.error('Failed to request payment:', error);
      alert(error.response?.data?.error || 'Failed to send payment request');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Order Management</h1>

      {/* Order Approval Banner */}
      {workflowInfo?.current_status === 'pending' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                <FiAlertCircle className="h-6 w-6" />
                Order Pending Approval
              </h3>
              <p className="text-yellow-700 mt-1">
                This order is waiting for your approval to proceed
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApproveOrder}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold shadow-lg"
              >
                <FiCheckCircle className="h-5 w-5" />
                Approve Order
              </button>
              <button
                onClick={handleRejectOrder}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold shadow-lg"
              >
                <FiX className="h-5 w-5" />
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900">Order Progress</h2>
            <p className="text-blue-700 mt-1">
              Current Status: <span className="font-bold">{workflowInfo?.current_status_display}</span>
            </p>
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-lg"
          >
            <FiEdit className="h-5 w-5" />
            Update Status
          </button>
        </div>
        {workflowInfo && (
          <StatusTimeline 
            workflowInfo={workflowInfo}
            onStatusClick={() => setShowStatusModal(true)}
          />
        )}
        
        {/* Quick Status Actions */}
        {workflowInfo?.allowed_next_statuses && workflowInfo.allowed_next_statuses.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Actions:</h3>
            <div className="flex flex-wrap gap-2">
              {workflowInfo.allowed_next_statuses.map((status: any) => (
                <button
                  key={status.value}
                  onClick={async () => {
                    if (confirm(`Update status to "${status.label}"?`)) {
                      try {
                        await updateOrderStatus(parseInt(orderId!), {
                          new_status: status.value,
                          notes: `Status updated to ${status.label}`
                        });
                        fetchWorkflowInfo();
                      } catch (error) {
                        console.error('Failed to update status:', error);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm font-medium"
                >
                  → {status.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Partial Payment Request Section */}
      {order && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Request</h2>
          
          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Order Value</p>
              <p className="text-2xl font-bold text-blue-900">₹{order.price || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-green-900">₹{order.total_paid || 0}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Remaining</p>
              <p className="text-2xl font-bold text-orange-900">
                ₹{(order.price || 0) - (order.total_paid || 0)}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Progress</span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(((order.total_paid || 0) / (order.price || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((order.total_paid || 0) / (order.price || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Request Payment Button */}
          <button
            onClick={() => setShowPaymentRequestModal(true)}
            disabled={(order.total_paid || 0) >= (order.price || 0)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            <FiDollarSign className="h-5 w-5" />
            Request Partial Payment
          </button>
          
          <p className="text-sm text-gray-600 mt-2">
            Request payment from client based on work progress. Amount must be less than remaining balance.
          </p>
        </div>
      )}

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
        <div className="space-y-4">
          <PaymentGatewaySelector
            orderId={parseInt(orderId!)}
            orderTitle="Order Title"
            amount="10000"
          />
          <PaymentHistory orderId={parseInt(orderId!)} />
        </div>
      </div>

      {/* Estimations Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Estimations</h2>
          <button
            onClick={() => setShowEstimationBuilder(!showEstimationBuilder)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {showEstimationBuilder ? 'Hide Builder' : 'Create Estimation'}
          </button>
        </div>
        {showEstimationBuilder && (
          <div className="mb-6">
            <EstimationBuilder
              orderId={parseInt(orderId!)}
              onSuccess={() => {
                setShowEstimationBuilder(false);
              }}
              onCancel={() => setShowEstimationBuilder(false)}
            />
          </div>
        )}
        <EstimationList orderId={parseInt(orderId!)} />
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <button
            onClick={() => setShowInvoiceGenerator(!showInvoiceGenerator)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {showInvoiceGenerator ? 'Hide Generator' : 'Generate Invoice'}
          </button>
        </div>
        {showInvoiceGenerator && (
          <div className="mb-6">
            <InvoiceGenerator
              orderId={parseInt(orderId!)}
              onSuccess={() => {
                setShowInvoiceGenerator(false);
              }}
              onCancel={() => setShowInvoiceGenerator(false)}
            />
          </div>
        )}
        <InvoiceList orderId={parseInt(orderId!)} />
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Task Management</h2>
        <TaskManager
          orderId={parseInt(orderId!)}
          canEdit={true}
          onCreateTask={() => setShowTaskModal(true)}
        />
      </div>

      {/* Deliverables Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Deliverables</h2>
        <DeliverableUpload orderId={parseInt(orderId!)} />
      </div>

      {/* Payment Request Modal */}
      {showPaymentRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Request Partial Payment</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={(order?.price || 0) - (order?.total_paid || 0)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₹{(order?.price || 0) - (order?.total_paid || 0)}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Payment Request
              </label>
              <textarea
                value={paymentReason}
                onChange={(e) => setPaymentReason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="E.g., 50% work completed, milestone achieved..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentGateway('razorpay')}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    paymentGateway === 'razorpay'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">Razorpay</div>
                    <div className="text-xs text-gray-500">Indian Payments (INR)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('paypal')}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    paymentGateway === 'paypal'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">PayPal</div>
                    <div className="text-xs text-gray-500">International (USD/EUR)</div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentRequestModal(false);
                  setPaymentAmount('');
                  setPaymentReason('');
                  setPaymentGateway('razorpay');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPartialPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Send Payment Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showStatusModal && workflowInfo && (
        <StatusUpdateModal
          orderId={parseInt(orderId!)}
          workflowInfo={workflowInfo}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => {
            fetchWorkflowInfo();
            setShowStatusModal(false);
          }}
        />
      )}

      {showTaskModal && (
        <TaskCreateModal
          orderId={parseInt(orderId!)}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
          }}
        />
      )}
    </div>
  );
}
