import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Share2,
  Printer,
  Star,
  Sparkles,
  Rocket,
  Shield,
  Award,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  X,
  BarChart,
  Layers,
  BookOpen,
  Archive,
  RefreshCw,
  ExternalLink,
  Zap,
  Target,
  Users,
  CreditCard,
  Receipt,
  Calculator,
  AlertCircle,
  Info,
  ChevronRight,
  ArrowUpRight,
  Lock,
  Unlock,
  FileCheck,
  FileX,
  FileClock,
  FilePlus,
  FileMinus,
  FileSearch,
  FileSignature,
  FileBarChart,
  FileSpreadsheet
} from 'lucide-react';
import { listEstimations } from '../../../api/estimations';
import { listInvoices } from '../../../api/invoices';
import type { Estimation } from '../../../types/estimations';
import type { Invoice } from '../../../types/invoices';
import { format } from 'date-fns';


// Floating particles system
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
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


// Premium Document Card Component
const DocumentCard = ({ document, type, index }: { document: any; type: 'estimation' | 'invoice'; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 
  const getStatusConfig = getStatusBadgeConfig(type === 'estimation' ? document.status : document.status);
  const cardRef = useRef<HTMLDivElement>(null);


  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };


  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 12
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
      className="relative group"
    >
      {/* Animated background gradient */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusConfig.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700`} />
     
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
        {/* FloatingParticles - hidden on mobile */}
        <div className="hidden md:block">
          <FloatingParticles />
        </div>
       
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 transition-all duration-700 rounded-2xl" />
       
        {/* Top bar with status and menu */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          {/* Document icon with animation */}
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className={`absolute -inset-2 bg-gradient-to-r ${getStatusConfig.gradient} rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
            <div className={`relative p-3 rounded-xl bg-gradient-to-r ${getStatusConfig.gradient} shadow-2xl`}>
              <FileText className="w-6 h-6 text-white" />
            </div>
          </motion.div>
         
          {/* Status badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.2 }}
            className="relative"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${getStatusConfig.gradient} rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
            <span className={`relative inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${getStatusConfig.bg} ${getStatusConfig.text} border ${getStatusConfig.borderColor} backdrop-blur-sm shadow-lg`}>
              <span className="mr-1.5">{getStatusConfig.emoji}</span>
              <getStatusConfig.icon className="w-3.5 h-3.5 mr-1.5" />
              {getStatusConfig.label}
              {getStatusConfig.pulse && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ml-2 w-1.5 h-1.5 rounded-full bg-current opacity-70"
                />
              )}
            </span>
          </motion.div>
        </div>
       
        {/* Document title and details */}
        <div className="mb-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.3 }}
          >
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-500 mb-2 truncate">
              {type === 'estimation' ? document.title : document.invoice_number}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {type === 'estimation' ? document.description : document.title}
            </p>
          </motion.div>
         
          {/* Document stats with staggered animation */}
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: index * 0.05 + 0.4
                }
              }
            }}
          >
            {/* Amount */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 }
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm"
            >
              <div className="flex items-center">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 mr-3">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount</span>
              </div>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {formatCurrency(type === 'estimation' ? document.total_amount : document.total_amount)}
              </span>
            </motion.div>
           
            {/* Date and validity */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 }
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span>{format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
              </div>
             
              {(document.valid_until || document.due_date) && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  <span>Until: {format(new Date(document.valid_until || document.due_date), 'MMM dd')}</span>
                </div>
              )}
            </motion.div>
           
            {/* Additional info for invoices */}
            {type === 'invoice' && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="space-y-2"
              >
                {parseFloat(document.amount_paid) > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Paid</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                      ?{document.amount_paid}
                    </span>
                  </div>
                )}
                {parseFloat(document.balance_due) > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-rose-50/50 to-red-50/50 dark:from-rose-900/10 dark:to-red-900/10">
                    <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Due</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-300">
                      ?{document.balance_due}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
       
        {/* Action buttons with hover reveal */}
        <div className="relative z-10">
          <AnimatePresence>
            {isHovered ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center space-x-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(document.pdf_url, `${type}-${document.id}.pdf`)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${getStatusConfig.gradient} shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
               
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
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
         
          {/* Dropdown menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50"
              >
                <div className="p-2">
                  <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors">
                    <Eye className="w-4 h-4 mr-2 text-blue-500" />
                    Preview Document
                  </button>
                  <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors">
                    <Share2 className="w-4 h-4 mr-2 text-purple-500" />
                    Share
                  </button>
                  <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors">
                    <Printer className="w-4 h-4 mr-2 text-amber-500" />
                    Print
                  </button>
                  <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors">
                    <Archive className="w-4 h-4 mr-2 text-gray-500" />
                    Archive
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};


// Premium Header Component
const PremiumHeader = () => {
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
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl"
              >
                <FileText className="w-8 h-8 text-white" />
              </motion.div>
             
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
                  Documents Center
                  <Sparkles className="inline w-8 h-8 ml-4 text-blue-500 animate-float" />
                </h1>
                <p className="hidden sm:block text-gray-600 dark:text-gray-400 text-lg mt-2">
                  Manage all your estimations and invoices in one place
                </p>
              </div>
            </div>
           
            {/* Stats badges */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/30 dark:border-emerald-700/30"
              >
                <Shield className="w-4 h-4 text-emerald-500 mr-2.5" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Secure Storage</span>
              </motion.div>
             
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/30 dark:border-amber-700/30"
              >
                <Award className="w-4 h-4 text-amber-500 mr-2.5" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Organized</span>
              </motion.div>
             
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/30 dark:border-cyan-700/30"
              >
                <Zap className="w-4 h-4 text-blue-500 mr-2.5" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Quick Access</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// Premium Filter Bar Component
const PremiumFilterBar = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  estimations,
  invoices
}: any) => {
  const [showFilters, setShowFilters] = useState(false);


  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('estimations')}
              className={`flex items-center px-6 py-3.5 text-sm font-bold transition-all duration-300 relative ${
                activeTab === 'estimations'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Estimations
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600"
              >
                {estimations.length}
              </motion.span>
            </motion.button>
           
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center px-6 py-3.5 text-sm font-bold transition-all duration-300 relative ${
                activeTab === 'invoices'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Invoices
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600"
              >
                {invoices.length}
              </motion.span>
            </motion.button>
          </div>


          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-xl blur opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents by title, amount, or status..."
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


          {/* Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </motion.button>
           

          </div>
        </div>


        {/* Filter dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    Status
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <option>All Status</option>
                    <option>Approved</option>
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    Date Range
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <option>All Time</option>
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    Amount
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <option>Any Amount</option>
                    <option>0 - 1,000</option>
                    <option>1,000 - 5,000</option>
                    <option>5,000+</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    Sort By
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <option>Newest First</option>
                    <option>Oldest First</option>
                    <option>Amount: High to Low</option>
                    <option>Amount: Low to High</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


// Enhanced status badge configuration
const getStatusBadgeConfig = (status: string) => {
  const configs: Record<string, {
    bg: string;
    text: string;
    gradient: string;
    icon: any;
    borderColor: string;
    label: string;
    emoji: string;
    pulse?: boolean;
  }> = {
    draft: {
      bg: 'bg-gradient-to-r from-gray-50/80 to-slate-50/80 dark:from-gray-900/20 dark:to-slate-900/20',
      text: 'text-gray-700 dark:text-gray-400',
      gradient: 'from-gray-500 to-slate-500',
      icon: Clock,
      borderColor: 'border-gray-200/50 dark:border-gray-700/50',
      label: 'Draft',
      emoji: '??'
    },
    sent: {
      bg: 'bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/30',
      text: 'text-blue-700 dark:text-blue-400',
      gradient: 'from-blue-500 to-cyan-500',
      icon: Clock,
      borderColor: 'border-blue-200/50 dark:border-blue-700/50',
      label: 'Sent',
      emoji: '??',
      pulse: true
    },
    approved: {
      bg: 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20',
      text: 'text-green-700 dark:text-green-400',
      gradient: 'from-green-500 to-emerald-500',
      icon: CheckCircle,
      borderColor: 'border-green-200/50 dark:border-green-700/50',
      label: 'Approved',
      emoji: '?'
    },
    rejected: {
      bg: 'bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20',
      text: 'text-red-700 dark:text-red-400',
      gradient: 'from-red-500 to-rose-500',
      icon: XCircle,
      borderColor: 'border-red-200/50 dark:border-red-700/50',
      label: 'Rejected',
      emoji: '?'
    },
    expired: {
      bg: 'bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-900/20 dark:to-gray-800/30',
      text: 'text-gray-600 dark:text-gray-400',
      gradient: 'from-gray-500 to-gray-600',
      icon: XCircle,
      borderColor: 'border-gray-200/50 dark:border-gray-700/50',
      label: 'Expired',
      emoji: '?'
    },
    pending: {
      bg: 'bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/20 dark:to-amber-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      gradient: 'from-yellow-500 to-amber-500',
      icon: Clock,
      borderColor: 'border-yellow-200/50 dark:border-yellow-700/50',
      label: 'Pending',
      emoji: '?',
      pulse: true
    },
    partial: {
      bg: 'bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20',
      text: 'text-orange-700 dark:text-orange-400',
      gradient: 'from-orange-500 to-amber-500',
      icon: Clock,
      borderColor: 'border-orange-200/50 dark:border-orange-700/50',
      label: 'Partially Paid',
      emoji: '??',
      pulse: true
    },
    paid: {
      bg: 'bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/30',
      text: 'text-green-700 dark:text-green-400',
      gradient: 'from-emerald-500 to-green-500',
      icon: CheckCircle,
      borderColor: 'border-green-200/50 dark:border-green-700/50',
      label: 'Paid',
      emoji: '??'
    },
    overdue: {
      bg: 'bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-pink-900/20',
      text: 'text-red-700 dark:text-red-400',
      gradient: 'from-red-500 to-pink-500',
      icon: XCircle,
      borderColor: 'border-red-200/50 dark:border-red-700/50',
      label: 'Overdue',
      emoji: '??',
      pulse: true
    },
    cancelled: {
      bg: 'bg-gradient-to-r from-gray-50/80 to-slate-50/80 dark:from-gray-900/20 dark:to-slate-900/20',
      text: 'text-gray-600 dark:text-gray-400',
      gradient: 'from-gray-500 to-slate-500',
      icon: XCircle,
      borderColor: 'border-gray-200/50 dark:border-gray-700/50',
      label: 'Cancelled',
      emoji: '??'
    },
  };
 
  return configs[status] || configs.draft;
};


// Handle download function
const handleDownload = (pdfUrl: string, filename: string) => {
  window.open(pdfUrl, '_blank');
};


export default function Documents() {
  const [activeTab, setActiveTab] = useState<'estimations' | 'invoices'>('estimations');
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    fetchDocuments();
  }, []);


  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);


      const [estimationsRes, invoicesRes] = await Promise.all([
        listEstimations().catch((err) => {

          return { data: [] };
        }),
        listInvoices().catch((err) => {

          return { data: [] };
        })
      ]);


      setEstimations(estimationsRes.data || []);
      setInvoices(invoicesRes.data || []);
    } catch (err: any) {

      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };


  // Filter documents based on search
  const filteredEstimations = estimations.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.total_amount?.toString().includes(searchQuery)
  );


  const filteredInvoices = invoices.filter(doc =>
    doc.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.total_amount?.toString().includes(searchQuery)
  );


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <FileText className="w-16 h-16 text-blue-500" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-4 text-gray-600 dark:text-gray-400 text-lg"
          >
            Loading documents...
          </motion.p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Documents</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchDocuments}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10 p-6">
      {/* FloatingParticles - hidden on mobile */}
      <div className="hidden md:block">
        <FloatingParticles />
      </div>
     
      {/* Premium Header */}
      <PremiumHeader />
     
      {/* Premium Filter Bar */}
      <PremiumFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        estimations={estimations}
        invoices={invoices}
      />
     
      {/* Documents Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'estimations' ? (
            filteredEstimations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-gray-700/30 shadow-xl text-center"
              >
                <Calculator className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-float-slow" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  No Estimations Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'Your estimations will appear here once created'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Clear Search
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                {/* Mobile (Horizontal Scroll) */}
                <div className="flex lg:hidden overflow-x-auto pb-6 gap-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
                  {filteredEstimations.map((estimation, index) => (
                    <div key={estimation.id} className="min-w-[85vw] snap-center">
                      <DocumentCard
                        document={estimation}
                        type="estimation"
                        index={index}
                      />
                    </div>
                  ))}
                </div>
                {/* Desktop (Grid) */}
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEstimations.map((estimation, index) => (
                    <DocumentCard
                      key={estimation.id}
                      document={estimation}
                      type="estimation"
                      index={index}
                    />
                  ))}
                </div>
              </>
            )
          ) : (
            filteredInvoices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-gray-700/30 shadow-xl text-center"
              >
                <Receipt className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-float-slow" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  No Invoices Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'Your invoices will appear here once generated'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Clear Search
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                {/* Mobile (Horizontal Scroll) */}
                <div className="flex lg:hidden overflow-x-auto pb-6 gap-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
                  {filteredInvoices.map((invoice, index) => (
                    <div key={invoice.id} className="min-w-[85vw] snap-center">
                      <DocumentCard
                        document={invoice}
                        type="invoice"
                        index={index}
                      />
                    </div>
                  ))}
                </div>
                {/* Desktop (Grid) */}
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInvoices.map((invoice, index) => (
                    <DocumentCard
                      key={invoice.id}
                      document={invoice}
                      type="invoice"
                      index={index}
                    />
                  ))}
                </div>
              </>
            )
          )}
        </motion.div>
      </AnimatePresence>


      {/* Floating Refresh Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        onClick={fetchDocuments}
        className="fixed bottom-8 left-8 flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
      >
        <RefreshCw className="w-6 h-6" />
      </motion.button>


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


        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }


        .animate-float {
          animation: float 6s ease-in-out infinite;
        }


        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }


        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
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

