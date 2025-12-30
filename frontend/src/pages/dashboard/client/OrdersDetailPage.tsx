import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PaymentHistory,
  EstimationList,
  EstimationViewer,
  InvoiceList,
  InvoiceViewer,
  TaskManager,
  StatusTimeline
} from '../../../components';
import { getWorkflowInfo } from '../../../api/workflow';
import type { WorkflowInfo } from '../../../types/workflow';
import type { Estimation } from '../../../types/estimations';
import type { Invoice } from '../../../types/invoices';
import { getOrder, type Order } from '../../../api/orders';
import { getOrderTransactions } from '../../../api/payments';
import { Transaction } from '../../../types/payments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Rocket,
  Shield,
  Award,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  Calculator,
  Receipt,
  CheckSquare,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Calendar,
  Target,
  BarChart,
  Eye,
  Download,
  Share2,
  MoreVertical,
  ChevronRight,
  Zap,
  Star,
  Bell,
  Settings,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  AwardIcon,
  Trophy,
  Crown,
  Gem,
  Diamond,
  Sparkle,
  TargetIcon,
  Code
} from 'lucide-react';


// Floating particles system
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.2}s`,
          animationDuration: `${12 + Math.random() * 10}s`,
        }}
      />
    ))}
  </div>
);


// Premium Back Navigation Component
const PremiumBackNavigation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-6"
    >
      <Link
        to="/client-dashboard/orders"
        className="inline-flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
        <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Back to Orders
        </span>
      </Link>
    </motion.div>
  );
};


// Helper to get order title
const getOrderTitle = (order: Order) => {
  if (order.form_submission_data?.data?.['Project Title']) {
    return order.form_submission_data.data['Project Title'];
  }
  return order.title || `Order #${order.id}`;
};

// Premium Order Header Component
const PremiumOrderHeader = ({ order }: { order: Order | null }) => {
  const [isStatusHovered, setIsStatusHovered] = useState(false);

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-cyan-900/10 p-8 mb-8 border border-white/20 dark:border-gray-700/30"
    >
      {/* FloatingParticles - hidden on mobile */}
      <div className="hidden md:block">
        <FloatingParticles />
      </div>
     
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 animate-gradient" />
     
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="hidden md:block p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl"
              >
                <Package className="w-7 h-7 text-white" />
              </motion.div>
             
              <div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {order.service_title} • Tracking order #{order.id} • Real-time updates enabled
                </p>
              </div>
            </div>
           
            {/* Order status with animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block"
              onMouseEnter={() => setIsStatusHovered(true)}
              onMouseLeave={() => setIsStatusHovered(false)}
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: isStatusHovered ? 360 : 0 }}
                    transition={{ duration: 0.6 }}
                    className="mr-3"
                  >
                    <Clock className="w-5 h-5 text-blue-500" />
                  </motion.div>
                  <div>
                    <div className="font-bold text-blue-700 dark:text-blue-400 capitalize">{order.status.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active • Updated just now</div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-4 w-2 h-2 rounded-full bg-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>
         
          {/* Quick stats */}
          <div className="hidden md:flex flex-col sm:flex-row lg:flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/30 dark:border-emerald-700/30"
            >
              <Shield className="w-4 h-4 text-emerald-500 mr-2.5" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Secure Order</span>
            </motion.div>
           
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/30 dark:border-amber-700/30"
            >
              <Award className="w-4 h-4 text-amber-500 mr-2.5" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Premium Service</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// Premium Tabs Component
const PremiumTabs = ({ activeTab, setActiveTab }: any) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye, color: 'from-blue-500 to-cyan-500' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-emerald-500 to-green-500' },
    { id: 'estimations', label: 'Estimations', icon: Calculator, color: 'from-purple-500 to-pink-500' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, color: 'from-amber-500 to-orange-500' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, color: 'from-rose-500 to-red-500' },
  ];


  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-2 border border-white/20 dark:border-gray-700/30 shadow-xl">
        <div className="flex overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
           
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 mx-1 relative ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
               
                <Icon className={`w-4 h-4 mr-2.5 relative z-10 ${isActive ? 'text-white' : ''}`} />
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
               
                {/* Notification dot for updates */}
                {(tab.id === 'payments' || tab.id === 'tasks') && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 ml-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};


// Premium Order Overview Component
const OrderOverview = ({ order, transactions }: { order: Order | null; transactions: Transaction[] }) => {
  if (!order) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;

  const calculateDaysElapsed = (startDate?: string) => {
    if (!startDate) return '0 Days';
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return `${diffDays} Days`;
  };

  const calculateEstimatedDelivery = (startDate?: string, deliveryDays?: number) => {
    if (!startDate || !deliveryDays) return 'TBD';
    const start = new Date(startDate);
    start.setDate(start.getDate() + deliveryDays);
    return start.toLocaleDateString();
  };

  const stats = [
    { label: 'Total Invested', value: `₹${order.price}`, icon: DollarSign, color: 'from-emerald-500 to-green-500' },
    { label: 'Time Elapsed', value: calculateDaysElapsed(order.created_at), icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { label: 'Est. Delivery', value: calculateEstimatedDelivery(order.created_at, order.pricing_plan?.delivery_days), icon: Target, color: 'from-amber-500 to-orange-500' },
    { label: 'Remaining Amount', value: `₹${order.remaining_amount || 0}`, icon: CreditCard, color: 'from-rose-500 to-red-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 mb-6 snap-x snap-mandatory">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group min-w-[140px] snap-center"
            >
              <div className={`hidden md:block absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
             
              <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-4 md:p-4 border border-white/20 dark:border-gray-700/30 shadow-xl aspect-square md:aspect-auto flex flex-col justify-center items-center md:items-start md:justify-between h-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                  <div className="text-center md:text-left">
                    <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 md:mb-1">{stat.label}</p>
                    <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`hidden md:block p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
               
                {/* Progress indicator - Hidden on Mobile */}
                <div className="hidden md:block mt-4 h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden w-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${order.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1.5 }}
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>


      {/* Order Details Grid - Horizontal Scroll on Mobile */}
      <div className="flex flex-col md:grid md:grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex overflow-x-auto pb-4 gap-6 md:contents snap-x snap-mandatory">
          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 min-w-[85vw] md:min-w-0 snap-center"
          >
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h3>
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </motion.button>
            </div>
           
            <div className="space-y-4">
              {[
                { label: 'Service Title', value: order.service_title || 'N/A', icon: Code, hidden: false },
                { label: 'Start Date', value: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A', icon: Calendar, hidden: false },
                { label: 'Estimated Delivery', value: calculateEstimatedDelivery(order.created_at, order.pricing_plan?.delivery_days), icon: Target, hidden: false },
                { label: 'Paid Amount', value: `₹${order.total_paid || 0}`, icon: DollarSign, hidden: false },
              ].map((item, index) => {
                const Icon = item.icon;
                if (item.hidden) return null;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 mr-3 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  </motion.div>
                );
              })}

              {/* Order Requirements from Form */}
              {order.details && (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                       <FileText className="w-4 h-4 text-blue-500 mr-2" />
                       Requirements
                    </h4>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                       <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                         {order.details}
                       </p>
                    </div>
                 </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Payments Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="min-w-[85vw] md:min-w-0 snap-center h-full"
        >
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Payments</h3>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
            </div>

            <div className="flex-1 overflow-auto -mx-2 px-2 custom-scrollbar max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Transaction ID</th>
                    <th className="py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 pr-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]" title={tx.transaction_id}>
                            {tx.transaction_id}
                          </p>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {tx.currency} {tx.amount}
                          </span>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {tx.completed_at ? new Date(tx.completed_at).toLocaleDateString() : '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </motion.div>
  );
};


// Premium Tab Wrapper Component
const PremiumTabWrapper = ({ children, value }: any) => {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      {children}
    </motion.div>
  );
};


export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [workflowInfo, setWorkflowInfo] = useState<WorkflowInfo | null>(null);
  const [selectedEstimation, setSelectedEstimation] = useState<Estimation | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);


  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchWorkflowInfo();
      fetchTransactions();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await getOrder(parseInt(orderId!));
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await getOrderTransactions(parseInt(orderId!));
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };


  const fetchWorkflowInfo = async () => {
    try {
      const response = await getWorkflowInfo(parseInt(orderId!));
      setWorkflowInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch workflow info:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10 p-6">
      {/* FloatingParticles - hidden on mobile */}
      <div className="hidden md:block">
        <FloatingParticles />
      </div>
     
      {/* Premium Back Navigation */}
      <PremiumBackNavigation />
     
      {/* Premium Order Header */}
      <PremiumOrderHeader order={order} />
     
      {/* Premium Tabs */}
      <PremiumTabs activeTab={activeTab} setActiveTab={setActiveTab} />
     
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <PremiumTabWrapper value="overview">
            <OrderOverview order={order} transactions={transactions} />
          </PremiumTabWrapper>
        )}
       
        {activeTab === 'payments' && (
          <PremiumTabWrapper value="payments">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
            >
              <PaymentHistory orderId={parseInt(orderId!)} />
            </motion.div>
          </PremiumTabWrapper>
        )}
       
        {activeTab === 'estimations' && (
          <PremiumTabWrapper value="estimations">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
            >
              {selectedEstimation ? (
                <div className="p-6">
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedEstimation(null)}
                    className="flex items-center mb-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Estimations
                  </motion.button>
                  <EstimationViewer
                    estimation={selectedEstimation}
                    isClient={true}
                  />
                </div>
              ) : (
                <EstimationList
                  orderId={parseInt(orderId!)}
                  onEstimationClick={(est) => setSelectedEstimation(est)}
                />
              )}
            </motion.div>
          </PremiumTabWrapper>
        )}
       
        {activeTab === 'invoices' && (
          <PremiumTabWrapper value="invoices">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
            >
              {selectedInvoice ? (
                <div className="p-6">
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedInvoice(null)}
                    className="flex items-center mb-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Invoices
                  </motion.button>
                  <InvoiceViewer invoice={selectedInvoice} />
                </div>
              ) : (
                <InvoiceList
                  orderId={parseInt(orderId!)}
                  onInvoiceClick={(inv) => setSelectedInvoice(inv)}
                />
              )}
            </motion.div>
          </PremiumTabWrapper>
        )}
       
        {activeTab === 'tasks' && (
          <PremiumTabWrapper value="tasks">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
            >
              <TaskManager
                orderId={parseInt(orderId!)}
                canEdit={false}
              />
            </motion.div>
          </PremiumTabWrapper>
        )}
       
        {activeTab === 'progress' && (
          <PremiumTabWrapper value="progress">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
            >
              {workflowInfo ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Progress Timeline</h3>
                    <motion.button
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.6 }}
                      onClick={fetchWorkflowInfo}
                      className="p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                    </motion.button>
                  </div>
                  <StatusTimeline workflowInfo={workflowInfo} />
                </div>
              ) : (
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-4"
                  >
                    <Clock className="w-12 h-12 text-blue-500" />
                  </motion.div>
                  <p className="text-gray-500 dark:text-gray-400">Loading progress timeline...</p>
                </div>
              )}
            </motion.div>
          </PremiumTabWrapper>
        )}
      </AnimatePresence>


      {/* Floating Action Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-8 right-8 flex flex-col items-end space-y-3 z-50"
      >
      </motion.div>


      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }


        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }


        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }


        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }


        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }


        .animate-float {
          animation: float 6s ease-in-out infinite;
        }


        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }


        .animate-shimmer {
          animation: shimmer 2s infinite;
        }


        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }


        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }


        ::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 4px;
        }


        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #06b6d4);
          border-radius: 4px;
        }


        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #0891b2);
        }
      `}</style>
    </div>
  );
}

