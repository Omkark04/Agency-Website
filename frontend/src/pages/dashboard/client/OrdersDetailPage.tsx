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


// Premium Order Header Component
const PremiumOrderHeader = ({ orderId }: { orderId: number }) => {
  const [isStatusHovered, setIsStatusHovered] = useState(false);


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
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl"
              >
                <Package className="w-7 h-7 text-white" />
              </motion.div>
             
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
                  Order Details
                  <Rocket className="inline w-8 h-8 ml-4 text-blue-500 animate-float" />
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Tracking order #{orderId} • Real-time updates enabled
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
                    <div className="font-bold text-blue-700 dark:text-blue-400">In Progress</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active • Updated 2 min ago</div>
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
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
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
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'from-indigo-500 to-blue-500' },
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


// Premium Overview Content
const PremiumOverviewContent = () => {
  const stats = [
    { label: 'Total Amount', value: '₹24,999', icon: DollarSign, color: 'from-emerald-500 to-green-500' },
    { label: 'Tasks Completed', value: '8/12', icon: CheckSquare, color: 'from-blue-500 to-cyan-500' },
    { label: 'Days Active', value: '14', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { label: 'Team Members', value: '5', icon: Users, color: 'from-amber-500 to-orange-500' },
  ];


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
             
              <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
               
                {/* Progress indicator */}
                <div className="mt-4 h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 70 + 30}%` }}
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


      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
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
                { label: 'Service Type', value: 'Web Development', icon: Code },
                { label: 'Start Date', value: 'Dec 15, 2024', icon: Calendar },
                { label: 'Estimated Delivery', value: 'Jan 30, 2025', icon: Target },
                { label: 'Priority Level', value: 'High', icon: Zap },
                { label: 'Client Contact', value: 'john@example.com', icon: Users },
              ].map((item, index) => {
                const Icon = item.icon;
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
            </div>
          </div>
        </motion.div>


        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
           
            <div className="space-y-3">
              {[
                { label: 'Download Invoice', icon: Download, color: 'from-blue-500 to-cyan-500' },
                { label: 'Share Progress', icon: Share2, color: 'from-purple-500 to-pink-500' },
                { label: 'Contact Support', icon: HelpCircle, color: 'from-emerald-500 to-green-500' },
                { label: 'View Documents', icon: FileText, color: 'from-amber-500 to-orange-500' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${action.color} shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <action.icon className="w-4 h-4 mr-3" />
                  {action.label}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
           
            {/* Recent Activity */}
            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {[
                  { time: '2 min ago', activity: 'Task completed by team' },
                  { time: '1 hour ago', activity: 'Payment received' },
                  { time: '3 hours ago', activity: 'Progress updated' },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3" />
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-white">{activity.activity}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{activity.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
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


  useEffect(() => {
    if (orderId) {
      fetchWorkflowInfo();
    }
  }, [orderId]);


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
      <PremiumOrderHeader orderId={parseInt(orderId!)} />
     
      {/* Premium Tabs */}
      <PremiumTabs activeTab={activeTab} setActiveTab={setActiveTab} />
     
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <PremiumTabWrapper value="overview">
            <PremiumOverviewContent />
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
        {/* Main Action Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full blur-xl opacity-70" />
          <button className="relative flex items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300">
            <MoreVertical className="w-6 h-6" />
          </button>
        </motion.div>
       
        {/* Action Menu Items */}
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col space-y-2"
        >
          {[
            { icon: Download, label: 'Export', color: 'from-emerald-500 to-green-500' },
            { icon: Share2, label: 'Share', color: 'from-purple-500 to-pink-500' },
            { icon: Bell, label: 'Notify', color: 'from-amber-500 to-orange-500' },
            { icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ x: -5 }}
              className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <action.icon className={`w-4 h-4 mr-2.5 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>


      {/* Animation Styles */}
      <style jsx global>{`
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

