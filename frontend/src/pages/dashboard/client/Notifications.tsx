import { useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../../api/notifications';
import type { Notification } from '../../../api/notifications';
import {
  Bell,
  CheckCircle,
  Clock,
  DollarSign,
  MessageSquare,
  Info,
  Check,
  Sparkles,
  Rocket,
  Shield,
  Award,
  Zap,
  Target,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Archive,
  Settings,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  ExternalLink,
  Star,
  Heart,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  User,
  Users,
  Package,
  FileText,
  CreditCard,
  Calendar,
  ShieldCheck,
  AwardIcon,
  Trophy,
  Crown,
  Gem,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// Floating particles system
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.2}s`,
          animationDuration: `${10 + Math.random() * 10}s`,
        }}
      />
    ))}
  </div>
);


// Premium Notification Card Component
const NotificationCard = ({ notification, index, onMarkAsRead }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
 
  const notificationConfig = getNotificationConfig(notification.notification_type);
  const timeAgo = getTimeAgo(notification.created_at);


  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        y: -3,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Animated background gradient */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${notificationConfig.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
     
      {/* Main card */}
      <div className={`relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 ${
        notification.is_read
          ? 'border-gray-200/50 dark:border-gray-700/30'
          : 'border-blue-200/50 dark:border-blue-700/30 shadow-lg'
      } ${isHovered ? 'shadow-xl' : ''}`}>
        <FloatingParticles />
       
        {/* Unread indicator */}
        {!notification.is_read && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-2 top-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/40 to-cyan-500/40 rounded-full blur animate-pulse" />
              <div className="relative w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg" />
            </div>
          </motion.div>
        )}
       
        <div className="flex items-start space-x-4">
          {/* Notification icon with animation */}
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="relative flex-shrink-0"
          >
            <div className={`absolute -inset-2 bg-gradient-to-r ${notificationConfig.gradient} rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
            <div className={`relative p-3 rounded-xl bg-gradient-to-r ${notificationConfig.gradient} shadow-lg`}>
              <notificationConfig.icon className="w-5 h-5 text-white" />
            </div>
          </motion.div>
         
          {/* Notification content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className={`font-bold text-base ${
                  notification.is_read
                    ? 'text-gray-900 dark:text-white'
                    : 'text-blue-900 dark:text-blue-300'
                }`}>
                  {notification.title}
                  {!notification.is_read && (
                    <Sparkles className="inline w-3.5 h-3.5 ml-2 text-blue-400 animate-pulse" />
                  )}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    notification.is_read
                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {notificationConfig.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeAgo}
                  </span>
                </div>
              </div>
             
              {/* Action buttons */}
              <AnimatePresence>
                {isHovered ? (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center space-x-1"
                  >
                    {!notification.is_read && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 transition-all duration-300"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                  </motion.div>
                ) : (
                  !notification.is_read && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto animate-pulse" />
                      <p className="text-xs text-gray-400 mt-1">Hover</p>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
           
            {/* Notification message */}
            <p className={`text-sm leading-relaxed ${
              notification.is_read
                ? 'text-gray-600 dark:text-gray-300'
                : 'text-blue-800 dark:text-blue-400'
            } ${isExpanded ? '' : 'line-clamp-2'}`}>
              {notification.message}
            </p>
           
            {/* Expand/Collapse button */}
            {notification.message.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center"
              >
                {isExpanded ? 'Show less' : 'Read more'}
                <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
           
            {/* Quick actions for specific notification types */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium hover:shadow-md transition-all duration-300"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View Details
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:shadow-md transition-all duration-300"
                    >
                      <Archive className="w-3.5 h-3.5 mr-1.5" />
                      Archive
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// Premium Header Component
const PremiumHeader = ({ unreadCount, onMarkAllRead }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-cyan-900/10 p-8 mb-8 border border-white/20 dark:border-gray-700/30"
    >
      <FloatingParticles />
     
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 animate-gradient" />
     
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl">
                  <Bell className="w-8 h-8 text-white" />
                </div>
              </motion.div>
             
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
                  Notifications
                  <BellRing className="inline w-8 h-8 ml-4 text-blue-500 animate-float" />
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
                  Stay updated with real-time alerts and announcements
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
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Secure Alerts</span>
              </motion.div>
             
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/30 dark:border-amber-700/30"
              >
                <Zap className="w-4 h-4 text-amber-500 mr-2.5" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Real-time</span>
              </motion.div>
            </div>
          </div>
         
          {/* Unread count and actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl"
          >
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur" />
                <div className="relative text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {unreadCount}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Unread Notifications
              </p>
             
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMarkAllRead}
                  disabled={unreadCount === 0}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 ${
                    unreadCount > 0
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark All as Read
                </motion.button>
               
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};


// Premium Filter Bar Component
const PremiumFilterBar = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  notifications
}: any) => {
  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: notifications.filter((n: { is_read: any; }) => !n.is_read).length },
    { id: 'order', label: 'Orders', count: notifications.filter((n: { notification_type: string; }) => n.notification_type === 'order_update').length },
    { id: 'payment', label: 'Payments', count: notifications.filter((n: { notification_type: string; }) => n.notification_type === 'payment_received').length },
    { id: 'task', label: 'Tasks', count: notifications.filter((n: { notification_type: string; }) => n.notification_type === 'task_assigned').length },
    { id: 'message', label: 'Messages', count: notifications.filter((n: { notification_type: string; }) => n.notification_type === 'message').length },
  ];


  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex items-center overflow-x-auto pb-2">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold mx-1 transition-all duration-300 relative ${
                  activeFilter === filter.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {activeFilter === filter.id && (
                  <motion.div
                    layoutId="activeFilter"
                    className={`absolute inset-0 bg-gradient-to-r ${
                      filter.id === 'unread' ? 'from-blue-500 to-cyan-500' :
                      filter.id === 'order' ? 'from-purple-500 to-pink-500' :
                      filter.id === 'payment' ? 'from-emerald-500 to-green-500' :
                      filter.id === 'task' ? 'from-amber-500 to-orange-500' :
                      filter.id === 'message' ? 'from-rose-500 to-red-500' :
                      'from-gray-500 to-slate-500'
                    } rounded-xl`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
               
                <span className="relative z-10 whitespace-nowrap">{filter.label}</span>
                <span className={`relative z-10 ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeFilter === filter.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {filter.count}
                </span>
              </motion.button>
            ))}
          </div>


          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-xl blur opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
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


          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Sort
            </motion.button>
           
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Mute
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// Enhanced notification configuration
const getNotificationConfig = (type: string) => {
  const configs: Record<string, {
    icon: any;
    gradient: string;
    label: string;
    color: string;
  }> = {
    order_update: {
      icon: Package,
      gradient: 'from-purple-500 to-pink-500',
      label: 'Order Update',
      color: 'purple'
    },
    payment_received: {
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-500',
      label: 'Payment',
      color: 'emerald'
    },
    task_assigned: {
      icon: CheckCircle,
      gradient: 'from-amber-500 to-orange-500',
      label: 'Task',
      color: 'amber'
    },
    message: {
      icon: MessageSquare,
      gradient: 'from-rose-500 to-red-500',
      label: 'Message',
      color: 'rose'
    },
  };
 
  return configs[type] || {
    icon: Info,
    gradient: 'from-gray-500 to-slate-500',
    label: 'Info',
    color: 'gray'
  };
};


// Time ago function
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
 
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};


export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    fetchNotifications();
  }, []);


  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };


  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
   
    // Type filter
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'unread' && !notification.is_read) ||
      (activeFilter === 'order' && notification.notification_type === 'order_update') ||
      (activeFilter === 'payment' && notification.notification_type === 'payment_received') ||
      (activeFilter === 'task' && notification.notification_type === 'task_assigned') ||
      (activeFilter === 'message' && notification.notification_type === 'message');
   
    return matchesSearch && matchesFilter;
  });


  const unreadCount = notifications.filter(n => !n.is_read).length;


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Bell className="w-16 h-16 text-blue-500" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-4 text-gray-600 dark:text-gray-400 text-lg"
          >
            Loading notifications...
          </motion.p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10 p-6">
      <FloatingParticles />
     
      {/* Premium Header */}
      <PremiumHeader
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
      />
     
      {/* Premium Filter Bar */}
      <PremiumFilterBar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
      />
     
      {/* Notifications List */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-gray-700/30 shadow-xl text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur" />
                <Bell className="relative w-20 h-20 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                No Notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                {searchQuery || activeFilter !== 'all'
                  ? 'No notifications match your current filters'
                  : 'You\'re all caught up! Everything looks peaceful here.'
                }
              </p>
              {(searchQuery || activeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Floating Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-8 right-8 flex flex-col items-end space-y-3 z-50"
      >
        {/* Refresh Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchNotifications}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          <RefreshCw className="w-6 h-6" />
        </motion.button>
       
        {/* Settings Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-4 py-3 rounded-xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Settings</span>
        </motion.button>
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


        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }


        .animate-float {
          animation: float 6s ease-in-out infinite;
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


        /* Line clamp utility */
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
}
