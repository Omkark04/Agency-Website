import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrders } from '../../../api/orders';
import { listSubmissions } from '../../../api/forms';
import { listEstimations } from '../../../api/estimations';
import { listInvoices } from '../../../api/invoices';
import { listTransactions } from '../../../api/payments';
import type { Order } from '../../../api/orders';
import {
  Calendar,
  FileText,
  Eye,
  FolderOpen,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  X,
  Download,
} from 'lucide-react';

// Status configuration
const statuses = {
  'pending': {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: Clock,
  },
  'approved': {
    label: 'Approved',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: CheckCircle2,
  },
  'estimation_sent': {
    label: 'Estimation Sent',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    icon: FileText,
  },
  'in_progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Activity,
  },
  '25_done': {
    label: '25% Complete',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    icon: TrendingUp,
  },
  '50_done': {
    label: '50% Complete',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    icon: TrendingUp,
  },
  '75_done': {
    label: '75% Complete',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    icon: TrendingUp,
  },
  'ready_for_delivery': {
    label: 'Ready for Delivery',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2,
  },
  'delivered': {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2,
  },
  'payment_pending': {
    label: 'Payment Pending',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: DollarSign,
  },
  'payment_done': {
    label: 'Payment Done',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  'closed': {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
    icon: CheckCircle2,
  },
};

// Calculate due date from created_at + delivery_days
const calculateDueDate = (createdAt: string, deliveryDays: number): string => {
  const created = new Date(createdAt);
  const due = new Date(created);
  due.setDate(created.getDate() + deliveryDays);
  return due.toISOString();
};

// Calculate days remaining
const getDaysRemaining = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Calculate progress percentage from status
const getProgressFromStatus = (status: string): number => {
  const progressMap: Record<string, number> = {
    'pending': 0,
    'approved': 5,
    'estimation_sent': 10,
    'in_progress': 20,
    '25_done': 25,
    '50_done': 50,
    '75_done': 75,
    'ready_for_delivery': 90,
    'delivered': 95,
    'payment_pending': 98,
    'payment_done': 100,
    'closed': 100,
  };
  return progressMap[status] || 0;
};

// Project Card Component
const ProjectCard = ({ 
  order, 
  documentCounts,
  onViewForm 
}: { 
  order: Order; 
  documentCounts: { estimations: number; invoices: number; receipts: number; total: number };
  onViewForm: (orderId: number) => void;
}) => {
  const navigate = useNavigate();
  const status = statuses[order.status as keyof typeof statuses] || statuses['pending'];
  const StatusIcon = status.icon;
  
  // Calculate due date
  const dueDate = order.due_date || (order.created_at && order.pricing_plan?.delivery_days 
    ? calculateDueDate(order.created_at, order.pricing_plan.delivery_days)
    : null);
  
  const daysLeft = dueDate ? getDaysRemaining(dueDate) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  
  // Get order value
  const orderValue = order.price_card_price || order.price || order.total_price || 0;
  
  // Get progress from status
  const progress = getProgressFromStatus(order.status);
  
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in-up">
      {/* Card Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate mb-2">
              {order.title || `Order #${order.id}`}
            </h3>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${status.color} transition-all duration-200`}>
                <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details - Hidden on mobile */}
        <div className="hidden sm:block mb-4">
          {order.details && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {order.details}
            </p>
          )}
        </div>

        {/* Order Value - Prominent */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg transform group-hover:scale-[1.02] transition-transform duration-200">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Order Value</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{typeof orderValue === 'number' ? orderValue.toLocaleString() : orderValue}
          </p>
        </div>

        {/* Progress Bar - Real-time from status */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span className="text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm gap-2">
          <div className="flex flex-col gap-2 flex-1">
            {/* Due Date - Always show */}
            {dueDate ? (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                  {isOverdue ? `Overdue by ${-daysLeft} days` : `${daysLeft} days left`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  No due date set
                </span>
              </div>
            )}
            
            {/* Document Count Breakdown - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {documentCounts.total} docs ({documentCounts.estimations}E, {documentCounts.invoices}I, {documentCounts.receipts}R)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Eye Button - View Form Details */}
            <button
              onClick={() => onViewForm(order.id)}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              title="View Form Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            {/* View Details Button */}
            <button
              onClick={() => navigate(`/client-dashboard/orders/${order.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, index }: any) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </div>
      </div>
    </div>
  );
};

// Form Submission Details Modal
const FormDetailsModal = ({ submission, onClose }: { submission: any; onClose: () => void }) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Form Submission Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Form</p>
              <p className="font-semibold text-gray-900 dark:text-white">{submission.form_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
              <p className="font-semibold text-gray-900 dark:text-white">{submission.service_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted By</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {submission.submitted_by_name || submission.client_email || 'You'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(submission.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Price Card Section */}
          {submission.data?.price_card_id && submission.price_card_title && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Selected Price Plan
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{submission.price_card_title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan ID: {submission.data.price_card_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{submission.price_card_price?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Price</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Submission Data</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              {Object.entries(submission.data || {}).map(([key, value]: [string, any]) => {
                const fieldLabel = submission.form_fields?.[key]?.label || `Field ${key}`;
                const fieldType = submission.form_fields?.[key]?.type;
                
                if (fieldType === 'file' || key === 'price_card_id') return null;
                
                return (
                  <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{fieldLabel}</p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Uploaded Files Section */}
          {submission.files && Object.keys(submission.files).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Uploaded Files</h3>
              <div className="space-y-4">
                {Object.entries(submission.files).map(([fieldId, urls]: [string, any]) => {
                  const fieldLabel = submission.form_fields?.[fieldId]?.label || `Field ${fieldId}`;
                  const urlArray = Array.isArray(urls) ? urls : [urls];
                  return (
                    <div key={fieldId} className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{fieldLabel}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {urlArray.filter(Boolean).map((url, index) => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                          if (isImage) {
                            return (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                              >
                                <img src={url} alt={`Upload ${index + 1}`} className="w-full h-auto" />
                              </a>
                            );
                          } else {
                            return (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                <Download className="h-4 w-4" />
                                <span className="text-sm font-medium truncate">{url.split('/').pop() || `File ${index + 1}`}</span>
                              </a>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyProjects() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [estimations, setEstimations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, submissionsRes, estimationsRes, invoicesRes, transactionsRes] = await Promise.all([
        listOrders(),
        listSubmissions().catch(() => ({ data: [] })),
        listEstimations().catch(() => ({ data: [] })),
        listInvoices().catch(() => ({ data: [] })),
        listTransactions().catch(() => ({ data: [] }))
      ]);
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      setOrders(ordersData);
      setSubmissions(submissionsRes.data);
      setEstimations(estimationsRes.data || []);
      setInvoices(invoicesRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewForm = (orderId: number) => {
    const submission = submissions.find(sub => sub.order_id === orderId);
    if (submission) {
      setSelectedSubmission(submission);
    }
  };

  // Calculate document count for an order
  const getDocumentCounts = (orderId: number) => {
    const estimationCount = estimations.filter(e => e.order === orderId).length;
    const invoiceCount = invoices.filter(i => i.order === orderId).length;
    const receiptCount = transactions.filter(t => t.order_id === orderId && t.status === 'success').length;
    return {
      estimations: estimationCount,
      invoices: invoiceCount,
      receipts: receiptCount,
      total: estimationCount + invoiceCount + receiptCount
    };
  };

  // Calculate stats
  const totalProjects = orders.length;
  const activeProjects = orders.filter(o => 
    ['in_progress', '25_done', '50_done', '75_done', 'ready_for_delivery'].includes(o.status)
  ).length;
  const avgProgress = orders.length > 0 
    ? Math.round(orders.reduce((sum, o) => sum + getProgressFromStatus(o.status), 0) / orders.length)
    : 0;
  
  // Calculate budget usage (total value of in-progress orders)
  const budgetUsage = orders
    .filter(o => ['in_progress', '25_done', '50_done', '75_done'].includes(o.status))
    .reduce((sum, o) => {
      const value = o.price_card_price || o.price || o.total_price || 0;
      return sum + (typeof value === 'number' ? value : parseFloat(value.toString()) || 0);
    }, 0);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ['in_progress', '25_done', '50_done', '75_done'].includes(order.status);
    if (activeFilter === 'completed') return ['closed', 'delivered', 'payment_done'].includes(order.status);
    if (activeFilter === 'upcoming') return ['pending', 'approved', 'estimation_sent'].includes(order.status);
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Project Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Track progress, manage teams, and monitor project performance in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderOpen}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
          index={0}
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          icon={Activity}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          index={1}
        />
        <StatsCard
          title="Avg. Progress"
          value={`${avgProgress}%`}
          icon={TrendingUp}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
          index={2}
        />
        <StatsCard
          title="Budget Usage"
          value={`₹${budgetUsage.toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-r from-orange-500 to-red-500"
          index={3}
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6 flex gap-2 overflow-x-auto animate-fade-in">
        {[
          { key: 'all', label: 'All Projects', count: orders.length },
          { key: 'active', label: 'Active', count: activeProjects },
          { key: 'completed', label: 'Completed', count: orders.filter(o => ['closed', 'delivered', 'payment_done'].includes(o.status)).length },
          { key: 'upcoming', label: 'Upcoming', count: orders.filter(o => ['pending', 'approved', 'estimation_sent'].includes(o.status)).length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeFilter === key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {label} <span className="ml-1.5 opacity-75">({count})</span>
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredOrders.map((order, index) => (
            <div key={order.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <ProjectCard 
                order={order} 
                documentCounts={getDocumentCounts(order.id)}
                onViewForm={handleViewForm} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Form Details Modal */}
      {selectedSubmission && (
        <FormDetailsModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
        />
      )}

      {/* Animations - Desktop only */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
            opacity: 0;
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-out forwards;
          }
        }
        
        /* Mobile: No animations */
        @media (max-width: 767px) {
          .animate-fade-in,
          .animate-fade-in-up,
          .animate-scale-in {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}} />
    </div>
  );
}
