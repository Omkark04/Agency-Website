import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listOrders, type Order } from '../../../api/orders';
import { listPaymentRequests, createPaymentOrder, verifyPayment, type PaymentRequest } from '../../../api/payments';
import { completeRazorpayPayment } from '../../../utils/razorpay';
import PaymentRequestCard from '../../../components/payments/PaymentRequestCard';
import api from '../../../api/api';
import {
  CreditCard,
  Eye,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Sparkles,
  Zap,
  Rocket,
  Shield,
  Award,
  LineChart,
  Target,
  Users,
  FileText,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Payment Request Details Modal
const PaymentRequestDetailsModal = ({ paymentRequest, onClose }: { paymentRequest: PaymentRequest | null; onClose: () => void }) => {
  if (!paymentRequest) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Request Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Request ID</p>
              <p className="font-semibold text-gray-900 dark:text-white">#{paymentRequest.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
              <p className="font-semibold text-gray-900 dark:text-white">#{paymentRequest.order}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                paymentRequest.status === 'paid' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {paymentRequest.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(paymentRequest.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-6 border-2 border-orange-200 dark:border-orange-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Amount Due
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-orange-600 dark:text-orange-400">
                  ₹{parseFloat(paymentRequest.amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Currency: {paymentRequest.currency || 'INR'}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {paymentRequest.transaction_id && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transaction Details</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                <p className="font-mono text-gray-900 dark:text-white break-all">{paymentRequest.transaction_id}</p>
              </div>
            </div>
          )}

          {/* Payment Date */}
          {paymentRequest.paid_at && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Date</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white">
                  {new Date(paymentRequest.paid_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Floating particles system
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-float"
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


// Premium Status Badge Component
const PremiumStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = getStatusColor(status);
 
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.borderColor} shadow-lg backdrop-blur-sm relative overflow-hidden group`}
    >
      {/* Animated gradient border */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${statusConfig.gradient} rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
     
      {/* Status icon */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="mr-2.5 text-lg"
      >
        {statusConfig.icon}
      </motion.div>
     
      {/* Status text */}
      <span className="relative z-10">{formatStatus(status)}</span>
     
      {/* Pulsing dot for active statuses */}
      {(status.includes('progress') || status.includes('done')) && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ml-2.5 w-2 h-2 rounded-full bg-current opacity-70"
        />
      )}
    </motion.span>
  );
};


// Premium Stats Card Component
const PremiumStatsCard = ({
  title,
  value,
  icon: Icon,
  change,
  color,
  index,
  subtitle
}: any) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
 
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
 
  useEffect(() => {
    const timer = setTimeout(() => {
      const finalValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;
      const increment = finalValue / 40;
      let current = 0;
     
      const counter = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          setDisplayValue(finalValue);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 30);
     
      return () => clearInterval(counter);
    }, index * 150);
   
    return () => clearTimeout(timer);
  }, [value, index]);

  // Mobile: no animations, no icons
  if (isMobile) {
    return (
      <div className="relative">
        {/* Main card - Square on mobile with fixed height */}
        <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg aspect-square flex flex-col justify-between min-h-[140px]">
          <div className="relative z-10 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {title}
              </p>
              <p className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent line-clamp-1">
                {typeof value === 'string' ? value : displayValue.toLocaleString()}
              </p>
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{subtitle}</p>
            )}
          </div>
         
          {/* Simple progress bar on mobile */}
          <div className="h-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden mt-3">
            <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  // Desktop: full animations
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 12
      }}
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="relative group"
    >
      {/* Animated background gradient */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
     
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
        <FloatingParticles />
       
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {title}
              </p>
              <div className="flex items-baseline">
                <motion.p
                  key={displayValue}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                >
                  {typeof value === 'string' ? value : displayValue.toLocaleString()}
                </motion.p>
              </div>
             
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
              )}
            </div>
           
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className={`p-4 rounded-2xl bg-gradient-to-r ${color} shadow-2xl`}
            >
              <Icon className="w-7 h-7 text-white" />
            </motion.div>
          </div>
         
          {/* Animated progress bar */}
          <div className="h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: index * 0.1 + 0.3, duration: 1.5, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${color} rounded-full relative`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// Premium Order Row Component
const PremiumOrderRow = ({ order, index }: { order: Order; index: number }) => {
  const statusConfig = getStatusColor(order.status);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
 
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
 
  // Mobile: no animations, keep all columns like desktop
  if (isMobile) {
    return (
      <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
        {/* Order ID */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${statusConfig.gradient} shadow-md`}>
              <FileText className="w-3 h-3 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">#{order.id}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Order ID</p>
            </div>
          </div>
        </td>
       
        {/* Service Title */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="max-w-xs">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {order.title || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {order.service_title || 'Service'}
            </p>
          </div>
        </td>
       
        {/* Status Badge */}
        <td className="px-4 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.borderColor}`}>
            <span className="mr-1.5">{statusConfig.icon}</span>
            {formatStatus(order.status)}
          </span>
        </td>
       
        {/* Amount */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-1.5">
            <div className="p-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                ₹{order.price || '0'}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Amount</p>
            </div>
          </div>
        </td>
       
        {/* Date */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-1.5">
            <div className="p-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(order.created_at || new Date()).toLocaleDateString()}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Order Date</p>
            </div>
          </div>
        </td>
       
        {/* Actions - Always visible */}
        <td className="px-4 py-4 whitespace-nowrap">
          <Link
            to={`/client-dashboard/orders/${order.id}`}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg shadow-md text-sm"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View
          </Link>
        </td>
      </tr>
    );
  }
 
  // Desktop: full animations and hover effects
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{
        x: 5,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        transition: { duration: 0.2 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border-b border-gray-200/50 dark:border-gray-700/50 group"
    >
      {/* Order ID with animated hover effect */}
      <td className="px-6 py-5 whitespace-nowrap">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-r ${statusConfig.gradient} shadow-lg`}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">#{order.id}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Order ID</p>
            </div>
          </div>
        </motion.div>
      </td>
     
      {/* Service Title */}
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="max-w-xs">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {order.title || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {order.service_title || 'Service'}
          </p>
        </div>
      </td>
     
      {/* Status Badge */}
      <td className="px-6 py-5 whitespace-nowrap">
        <PremiumStatusBadge status={order.status} />
      </td>
     
      {/* Amount with animated number */}
      <td className="px-6 py-5 whitespace-nowrap">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2 }}
          className="flex items-center space-x-2"
        >
          <div className="p-1.5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-lg font-black text-gray-900 dark:text-white">
              ₹{order.price || '0'}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Amount</p>
          </div>
        </motion.div>
      </td>
     
      {/* Date */}
      <td className="px-6 py-5 whitespace-nowrap">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <div className="p-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {new Date(order.created_at || new Date()).toLocaleDateString()}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Order Date</p>
          </div>
        </motion.div>
      </td>
     
      {/* Actions */}
      <td className="px-6 py-5 whitespace-nowrap">
        <AnimatePresence>
          {isHovered ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              <Link
                to={`/client-dashboard/orders/${order.id}`}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
                <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
             
              <button className="p-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300">
                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto animate-pulse" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hover for actions</p>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  );
};


// Premium Header Component
const PremiumHeader = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-cyan-900/10 rounded-3xl p-8 mb-8 border border-white/20 dark:border-gray-700/30">
      {/* FloatingParticles - hidden on mobile */}
      <div className="hidden md:block">
        <FloatingParticles />
      </div>
     
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 animate-gradient" />
     
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-3">
                Orders & Payments
                <Rocket className="inline w-10 h-10 ml-4 text-blue-500 animate-float" />
              </h1>
              <p className="hidden sm:block text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                Track, manage, and analyze all your orders and payments in real-time
              </p>
            </div>
           
            {/* Trust badges */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/30 dark:border-emerald-700/30">
                <Shield className="w-5 h-5 text-emerald-500 mr-2.5" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Secure</span>
              </div>
              <div className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/30 dark:border-amber-700/30">
                <Award className="w-5 h-5 text-amber-500 mr-2.5" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Verified</span>
              </div>
            </div>
          </div>
         
          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 dark:from-blue-900/10 dark:to-cyan-900/10">
              <Zap className="w-4 h-4 text-blue-500 mr-2.5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-time Updates</span>
            </div>
            <div className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-900/10 dark:to-pink-900/10">
              <LineChart className="w-4 h-4 text-purple-500 mr-2.5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Analytics</span>
            </div>
            <div className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/5 to-green-500/5 dark:from-emerald-900/10 dark:to-green-900/10">
              <Target className="w-4 h-4 text-emerald-500 mr-2.5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Track Progress</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


// Premium Filter Bar Component
const PremiumFilterBar = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter
}: any) => {
  const filters = [
    { id: 'all', label: 'All Orders', icon: Package },
    { id: 'active', label: 'Active', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'progress', label: 'In Progress', icon: TrendingUp }
  ];


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-xl blur opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, service, or status..."
                className="w-full pl-12 pr-10 py-3.5 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg focus:shadow-2xl focus:border-blue-500 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1.5 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>


          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {filter.label}
                </motion.button>
              );
            })}
          </div>


          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </motion.button>
           

          </div>
        </div>
      </div>
    </motion.div>
  );
};


// Enhanced getStatusColor function with premium styling
const getStatusColor = (status: string) => {
  const colors: Record<string, {
    bg: string;
    text: string;
    gradient: string;
    icon: any;
    borderColor: string;
    pulse?: boolean;
  }> = {
    'pending': {
      bg: 'bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/20 dark:to-amber-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      gradient: 'from-yellow-500 to-amber-500',
      icon: '⏳',
      borderColor: 'border-yellow-200/50 dark:border-yellow-700/50',
      pulse: true
    },
    'approved': {
      bg: 'bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/30',
      text: 'text-blue-700 dark:text-blue-400',
      gradient: 'from-blue-500 to-cyan-500',
      icon: '✓',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50'
    },
    'in_progress': {
      bg: 'bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      icon: '⚡',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50',
      pulse: true
    },
    '25_done': {
      bg: 'bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/20 dark:to-blue-900/20',
      text: 'text-indigo-700 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-blue-500',
      icon: '25%',
      borderColor: 'border-indigo-200/50 dark:border-indigo-700/50',
      pulse: true
    },
    '50_done': {
      bg: 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20',
      text: 'text-indigo-700 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-purple-500',
      icon: '50%',
      borderColor: 'border-indigo-200/50 dark:border-indigo-700/50',
      pulse: true
    },
    '75_done': {
      bg: 'bg-gradient-to-r from-violet-50/80 to-purple-50/80 dark:from-violet-900/20 dark:to-purple-900/20',
      text: 'text-violet-700 dark:text-violet-400',
      gradient: 'from-violet-500 to-purple-500',
      icon: '75%',
      borderColor: 'border-violet-200/50 dark:border-violet-700/50',
      pulse: true
    },
    'ready_for_delivery': {
      bg: 'bg-gradient-to-r from-cyan-50/80 to-teal-50/80 dark:from-cyan-900/20 dark:to-teal-900/20',
      text: 'text-cyan-700 dark:text-cyan-400',
      gradient: 'from-cyan-500 to-teal-500',
      icon: '📦',
      borderColor: 'border-cyan-200/50 dark:border-cyan-700/50',
      pulse: true
    },
    'delivered': {
      bg: 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20',
      text: 'text-green-700 dark:text-green-400',
      gradient: 'from-green-500 to-emerald-500',
      icon: '✅',
      borderColor: 'border-green-200/50 dark:border-green-700/50'
    },
    'completed': {
      bg: 'bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/30',
      text: 'text-green-700 dark:text-green-400',
      gradient: 'from-green-500 to-emerald-500',
      icon: '🎉',
      borderColor: 'border-green-200/50 dark:border-green-700/50'
    },
    'closed': {
      bg: 'bg-gradient-to-r from-gray-50/80 to-slate-50/80 dark:from-gray-900/20 dark:to-slate-900/20',
      text: 'text-gray-700 dark:text-gray-400',
      gradient: 'from-gray-500 to-slate-500',
      icon: '🔒',
      borderColor: 'border-gray-200/50 dark:border-gray-700/50'
    },
    'payment_done': {
      bg: 'bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/30',
      text: 'text-green-700 dark:text-green-400',
      gradient: 'from-emerald-500 to-green-500',
      icon: '💰',
      borderColor: 'border-green-200/50 dark:border-green-700/50'
    },
  };
 
  return colors[status] || {
    bg: 'bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-900/20 dark:to-gray-800/30',
    text: 'text-gray-700 dark:text-gray-400',
    gradient: 'from-gray-500 to-gray-600',
    icon: '•',
    borderColor: 'border-gray-200/50 dark:border-gray-700/50'
  };
};


const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Payment requests state
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [payingRequestId, setPayingRequestId] = useState<number | null>(null);
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<PaymentRequest | null>(null);


  useEffect(() => {
    fetchOrders();
    fetchPaymentRequests();
  }, []);


  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await listOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const response = await listPaymentRequests();
      setPaymentRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    }
  };

  const handlePayNow = async (paymentRequest: PaymentRequest) => {
    try {
      setPayingRequestId(paymentRequest.id);
      setLoadingPayments(true);

      // Create payment order with payment request amount
      const orderResponse = await createPaymentOrder({
        order_id: paymentRequest.order,
        gateway: 'razorpay',
        currency: paymentRequest.currency || 'INR',
        amount: parseFloat(paymentRequest.amount)  // Use payment request amount, not full order amount
      });
      
      const razorpayData = orderResponse.data;

      // Type guard to ensure we have Razorpay data
      if (razorpayData.gateway !== 'razorpay') {
        throw new Error('Invalid payment gateway');
      }

      // Open Razorpay checkout
      const verificationData = await completeRazorpayPayment(
        razorpayData.razorpay_key,
        razorpayData.gateway_order_id,
        parseFloat(razorpayData.amount),
        razorpayData.order_details,
        razorpayData.customer
      );

      if (!verificationData) {
        // User closed the modal
        setPayingRequestId(null);
        setLoadingPayments(false);
        return;
      }

      // Verify payment
      await verifyPayment({
        gateway: 'razorpay',
        razorpay_order_id: verificationData.razorpay_order_id,
        razorpay_payment_id: verificationData.razorpay_payment_id,
        razorpay_signature: verificationData.razorpay_signature
      });

      // Success! Refresh data
      await fetchPaymentRequests();
      await fetchOrders();
      
      alert('Payment successful! Your receipt is ready for download.');
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setPayingRequestId(null);
      setLoadingPayments(false);
    }
  };

  const handleDownloadReceipt = (transactionId: string) => {
    try {
      const receiptUrl = `${api.defaults.baseURL}/payments/receipt/${transactionId}/`;
      window.open(receiptUrl, '_blank');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt');
    }
  };


  // Calculate stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status.includes('progress') || o.status.includes('done') || o.status === 'approved').length;
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'closed' || o.status === 'payment_done').length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const statsCards = [
    { title: "Total Orders", value: totalOrders, icon: Package, color: "from-blue-500 to-cyan-500", subtitle: "All time orders" },
    { title: "Active Orders", value: activeOrders, icon: Clock, color: "from-purple-500 to-pink-500", subtitle: "Currently processing" },
    { title: "Completed", value: completedOrders, icon: CheckCircle, color: "from-emerald-500 to-green-500", subtitle: "Successfully delivered" },
    { title: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, icon: DollarSign, color: "from-amber-500 to-orange-500", subtitle: "Total amount spent" }
  ];


  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' ||
      order.id.toString().includes(searchQuery) ||
      order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase());
   
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'active' && (order.status.includes('progress') || order.status.includes('done') || order.status === 'approved')) ||
      (activeFilter === 'completed' && (order.status === 'completed' || order.status === 'closed' || order.status === 'payment_done')) ||
      (activeFilter === 'payment' && order.status.includes('payment')) ||
      (activeFilter === 'progress' && order.status.includes('progress'));
   
    return matchesSearch && matchesFilter;
  });


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Package className="w-16 h-16 text-blue-500" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-4 text-gray-600 dark:text-gray-400 text-lg"
          >
            Loading orders...
          </motion.p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10">
      {/* FloatingParticles - hidden on mobile */}
      <div className="hidden md:block">
        <FloatingParticles />
      </div>
     
      {/* Premium Header */}
      <PremiumHeader />


      <div className="max-w-7xl mx-auto">
        {/* Premium Stats Cards */}
        <div className="mb-8">
          {/* Mobile Stats (Horizontal Scroll) */}
          <div className="flex lg:hidden overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
            {statsCards.map((stat, i) => (
              <div key={i} className="min-w-[30vw] snap-center">
                <PremiumStatsCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  subtitle={stat.subtitle}
                  index={i}
                />
              </div>
            ))}
          </div>

          {/* Desktop Stats (Grid) */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {statsCards.map((stat, i) => (
                <PremiumStatsCard
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  subtitle={stat.subtitle}
                  index={i}
                />
             ))}
          </div>
        </div>


        {/* Average Order Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Average Order Value</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Calculated across all orders</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  ₹{avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
           
            {/* Progress chart */}
            <div className="mt-6 h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>
        </motion.div>


        {/* Premium Filter Bar */}
        <PremiumFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />


        {/* Premium Orders Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order History</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredOrders.length} orders found
                </p>
              </div>
             
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Updated just now
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Package className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-float-slow" />
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                          No orders found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                          {searchQuery || activeFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Your orders will appear here once you place them'
                          }
                        </p>
                        {(searchQuery || activeFilter !== 'all') && (
                          <Button
                            onClick={() => {
                              setSearchQuery('');
                              setActiveFilter('all');
                            }}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                          >
                            Clear all filters
                          </Button>
                        )}
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredOrders.map((order, index) => (
                      <PremiumOrderRow key={order.id} order={order} index={index} />
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>


          {/* Table Footer */}
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-700 dark:text-gray-300">1-{filteredOrders.length}</span> of{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredOrders.length}</span> orders
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors">
                    ← Previous
                  </button>
                  <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    1
                  </span>
                  <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>


      {/* Payment Requests Section */}
      {loadingPayments && paymentRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <CreditCard className="w-12 h-12 text-orange-500" />
            </motion.div>
            <p className="ml-4 text-gray-600 dark:text-gray-400 text-lg">Loading payment requests...</p>
          </div>
        </motion.div>
      ) : paymentRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
              Payment Requests
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Outstanding payment requests from your service providers
            </p>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paymentRequests.map((paymentRequest) => (
              <PaymentRequestCard
                key={paymentRequest.id}
                paymentRequest={paymentRequest}
                onPayNow={handlePayNow}
                onDownloadReceipt={handleDownloadReceipt}
                loading={payingRequestId === paymentRequest.id && loadingPayments}
              />
            ))}
          </div>

          {/* Mobile: Horizontal scroll with compact cards */}
          <div className="md:hidden flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
            {paymentRequests.map((paymentRequest) => (
              <div key={paymentRequest.id} className="min-w-[85vw] snap-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-md">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Payment Request</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">#{paymentRequest.id}</p>
                      </div>
                    </div>
                    {paymentRequest.status === 'paid' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">
                        ✓ Paid
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-bold">
                        ⏳ Pending
                      </span>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Amount Due</p>
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                      ₹{parseFloat(paymentRequest.amount).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {paymentRequest.status === 'pending' ? (
                      <button
                        onClick={() => handlePayNow(paymentRequest)}
                        disabled={payingRequestId === paymentRequest.id && loadingPayments}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {payingRequestId === paymentRequest.id && loadingPayments ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </>
                        )}
                      </button>
                    ) : paymentRequest.transaction_id ? (
                      <button
                        onClick={() => handleDownloadReceipt(paymentRequest.transaction_id!)}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg shadow-md transition-all duration-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Receipt
                      </button>
                    ) : null}
                    
                    {/* Eye button for mobile - view full details */}
                    <button
                      onClick={() => setSelectedPaymentRequest(paymentRequest)}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}


      {/* Payment Request Details Modal */}
      <PaymentRequestDetailsModal 
        paymentRequest={selectedPaymentRequest} 
        onClose={() => setSelectedPaymentRequest(null)} 
      />

      {/* Animation Styles */}
      <style>{`
        /* Desktop animations */
        @media (min-width: 768px) {
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

          @keyframes float-slow {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
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

          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
        }

        /* Mobile: disable animations */
        @media (max-width: 767px) {
          .animate-fadeIn,
          .animate-slideUp,
          .animate-float,
          .animate-float-slow {
            animation: none !important;
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

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        /* Hide scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}


// Button component for consistency
const Button = ({ children, onClick, className }: any) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${className}`}
  >
    {children}
  </motion.button>
);

