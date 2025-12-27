
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { listOrders, getDashboardStats, getRecentActivity, type DashboardStats, type RecentActivity } from '../../../api/orders';
import { useAuth } from '../../../hooks/useAuth';
import { logout } from '../../../utils/auth';
import logo from '../../../assets/UdyogWorks logo.png';
import logoWhite from '../../../assets/UdyogWorks logo.png';
import OffersSection from '@/components/dashboard/OffersSection';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Home,
  Folder,
  Settings,
  Bell,
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  Menu,
  X,
  ChevronRight,
  Box,
  TrendingUp,
  TrendingDown,
  User,
  LogOut,
  HelpCircle,
  FileText,
  ChevronDown,
  Activity,
  ArrowRight,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

// Animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
};

// Theme context for global theme management
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export default function ClientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivityData, setRecentActivityData] = useState<RecentActivity[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAnimating, setIsAnimating] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursorEffect, setShowCursorEffect] = useState(false);

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Cursor effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setShowCursorEffect(true);
    const handleMouseLeave = () => setShowCursorEffect(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders for backward compatibility
      const ordersResponse = await listOrders();
      setOrders(ordersResponse.data || []);
      
      // Fetch dashboard statistics
      const statsResponse = await getDashboardStats();
      setDashboardStats(statsResponse.data);
      
      // Fetch recent activity
      const activityResponse = await getRecentActivity();
      setRecentActivityData(activityResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Calculate stats from real data
  const stats = [
    {
      id: 1,
      name: 'Total Orders',
      value: (dashboardStats?.total_orders || orders.length).toString(),
      icon: Folder,
      change: '+' + orders.filter(o => {
        const createdDate = new Date(o.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length,
      changeType: 'increase' as const,
      description: 'All time',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      darkBgColor: 'bg-gradient-to-br from-blue-900/20 to-blue-800/20',
      borderColor: 'border-blue-200 dark:border-blue-800/30'
    },
    {
      id: 2,
      name: 'In Progress',
      value: (dashboardStats?.active_orders || orders.filter(o => o.status === 'in_progress').length).toString(),
      icon: Clock,
      change: '',
      changeType: 'increase' as const,
      description: 'Active orders',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20',
      darkBgColor: 'bg-gradient-to-br from-amber-900/20 to-orange-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800/30'
    },
    {
      id: 3,
      name: 'Total Spent',
      value: '₹' + (dashboardStats?.total_spent || orders.reduce((sum, o) => sum + (o.total_price || 0), 0)).toLocaleString(),
      icon: CreditCard,
      change: '',
      changeType: 'increase' as const,
      description: 'All payments',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20',
      darkBgColor: 'bg-gradient-to-br from-emerald-900/20 to-green-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800/30'
    },
    {
      id: 4,
      name: 'Completed',
      value: (dashboardStats?.completed_orders || orders.filter(o => o.status === 'completed').length).toString(),
      icon: CheckCircle,
      change: '',
      changeType: 'increase' as const,
      description: 'Finished orders',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      darkBgColor: 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
      borderColor: 'border-purple-200 dark:border-purple-800/30'
    },
  ];

  // Helper function to format activity time
  const formatActivityTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Use backend activity data if available, otherwise fallback to orders
  const recentActivity = recentActivityData.length > 0 ? recentActivityData.map(activity => ({
    ...activity,
    time: formatActivityTime(activity.time)
  })) : orders.slice(0, 4).map(order => ({
    id: order.id.toString(),
    type: 'order_update',
    action: `Order ${order.status === 'completed' ? 'completed' : order.status === 'in_progress' ? 'in progress' : 'placed'}`,
    project: order.service_title || 'Service Order',
    time: formatActivityTime(new Date(order.created_at).toISOString()),
    status: order.status,
    order_id: order.id
  }));

  const getPageTitle = () => {
    if (location.pathname === '/client-dashboard') return 'Dashboard Overview';
    if (location.pathname.includes('services')) return 'My Services';
    if (location.pathname.includes('my-projects')) return 'My Projects';
    return 'Dashboard';
  };

  // Add scroll animation trigger
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => {
      if (scrollRef.current) {
        observer.unobserve(scrollRef.current);
      }
    };
  }, []);

  // Theme toggle animation variants
  const themeToggleVariants = {
    light: { rotate: 0, scale: 1 },
    dark: { rotate: 180, scale: 1.1 }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans antialiased transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* Animated cursor effect */}
      {showCursorEffect && (
        <motion.div
          className="fixed pointer-events-none z-[100]"
          animate={{
            x: cursorPosition.x - 16,
            y: cursorPosition.y - 16,
          }}
          transition={{ type: "spring", mass: 0.3 }}
        >
          <div className="h-6 w-6 rounded-full border-2 border-blue-500/30 dark:border-blue-400/30 backdrop-blur-sm"></div>
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      )}

      {/* Theme transition overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20"
              initial={{ scale: 0 }}
              animate={{ scale: 4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-[1px] bg-blue-500/20 dark:bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -30, 30, -30],
              x: [null, 20, -20, 20],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header - Fixed Position */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 right-0 z-50 transition-all duration-500 ${
          sidebarOpen ? 'left-64' : 'left-20'
        } ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800'
            : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg'
        }`}
        style={{
          transitionProperty: 'left, background-color, box-shadow, border, transform',
          transitionDuration: '400ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sidebarOpen ? (
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
           
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{getPageTitle()}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Welcome back, {user?.username || user?.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 group"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={themeToggleVariants}
              animate={theme}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              
              {/* Sun/Moon Icons */}
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="h-5 w-5 text-gray-700 dark:text-yellow-300 group-hover:text-yellow-500 transition-colors" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="h-5 w-5 text-gray-300 group-hover:text-blue-300 transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Sparkles effect */}
              <AnimatePresence>
                {isAnimating && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-400 dark:bg-blue-400 rounded-full"
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 1,
                          scale: 1,
                        }}
                        animate={{
                          x: Math.cos((i * 60) * Math.PI / 180) * 30,
                          y: Math.sin((i * 60) * Math.PI / 180) * 30,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search orders, projects..."
                className="pl-10 pr-4 py-2.5 w-64 bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Notification */}
            <Link
              to="/client-dashboard/notifications"
              className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 group"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 group"
                aria-expanded={showProfileMenu}
                aria-label="User menu"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-sm">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Client'}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 dark:text-gray-500 hidden md:block transition-transform duration-200 ${
                    showProfileMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50"
                    role="menu"
                  >
                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5 pointer-events-none" />
                    
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 relative z-10">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1 relative z-10">
                      <Link
                        to="/client-dashboard/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                        role="menuitem"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                        Your Profile
                      </Link>
                      <Link
                        to="/client-dashboard/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                        role="menuitem"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                        Settings
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                        role="menuitem"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <HelpCircle className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                        Help & Support
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 py-1 relative z-10">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 top-0 h-screen z-40 transition-all duration-500 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col`}
      >
        {/* Animated border gradient */}
        <div className="absolute right-0 inset-y-0 w-1 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent dark:via-blue-400/20" />
        
        {/* Logo */}
        <div className={`flex items-center ${sidebarOpen ? 'px-6' : 'justify-center px-0'} h-16 border-b border-gray-100 dark:border-gray-800`}>
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center shadow-sm">
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.img
                      key="light-logo"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      src={logo}
                      alt="UdyogWorks Logo"
                      className="h-10 sm:h-12 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <motion.img
                      key="dark-logo"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      src={logoWhite || logo} // Fallback to regular logo if white version not available
                      alt="UdyogWorks Logo"
                      className="h-10 sm:h-12 transition-transform duration-300 group-hover:scale-105 invert dark:invert-0"
                    />
                  )}
                </AnimatePresence>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">UdyogWorks</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Client Portal</p>
              </div>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">U</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            {/* Back to Homepage */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/"
                className="flex items-center px-4 py-3 mb-4 rounded-xl text-sm font-medium transition-all duration-200 group bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 hover:from-gray-100 dark:hover:from-gray-700 hover:to-gray-200 dark:hover:to-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <motion.div
                  whileHover={{ x: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400 rotate-90" />
                </motion.div>
                {sidebarOpen && (
                  <span className="ml-3">Back to Homepage</span>
                )}
              </Link>
            </motion.div>

            {[
              {
                path: '/client-dashboard',
                icon: Home,
                label: 'Dashboard',
                active: location.pathname === '/client-dashboard',
                badge: null
              },
              {
                path: '/client-dashboard/my-projects',
                icon: Folder,
                label: 'Projects',
                active: location.pathname.includes('my-projects'),
                badge: orders.filter(o => o.status === 'in_progress' || o.status === '25_done' || o.status === '50_done' || o.status === '75_done').length || null
              },
              {
                path: '/client-dashboard/services',
                icon: Box,
                label: 'Services',
                active: location.pathname.includes('services'),
                badge: null
              },
              {
                path: '/client-dashboard/orders',
                icon: CreditCard,
                label: 'Orders & Payments',
                active: location.pathname.includes('orders'),
                badge: null
              },
              {
                path: '/client-dashboard/documents',
                icon: FileText,
                label: 'Documents',
                active: location.pathname.includes('documents'),
                badge: null
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center px-3'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    item.active
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <div className="relative">
                    <item.icon
                      className={`h-5 w-5 ${item.active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}
                    />
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-xs font-medium ${
                          item.active ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                        }`}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      {item.active && (
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <ChevronRight className="ml-auto h-4 w-4 text-blue-500 dark:text-blue-400" />
                        </motion.div>
                      )}
                    </>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Settings Section */}
          <div className={`mt-8 ${!sidebarOpen && 'border-t border-gray-100 dark:border-gray-800 pt-6'}`}>
            {sidebarOpen && (
              <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Preferences
              </p>
            )}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/client-dashboard/settings"
                className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center px-3'} py-3 rounded-xl text-sm font-medium transition-colors group ${
                  location.pathname.includes('settings')
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={!sidebarOpen ? 'Settings' : ''}
              >
                <Settings className={`h-5 w-5 ${location.pathname.includes('settings') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                {sidebarOpen && <span className="ml-3">Settings</span>}
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900">
                <motion.div
                  className="absolute inset-0 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        ref={scrollRef}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={fadeIn}
        className={`transition-all duration-500 pt-16 min-h-screen ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <div className="p-6">
          {/* Dashboard Content */}
          {location.pathname === '/client-dashboard' && (
            <>
              {/* Animated Header with Gradient - Premium Style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 dark:from-indigo-900 dark:via-blue-900 dark:to-purple-900 p-8 shadow-2xl">
                  {/* Animated border */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-transparent"
                    animate={{
                      borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                  
                  {/* Animated background elements */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.758 10.365L48.67 3.537A1 1 0 0 0 47.5 3h-11a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 .707-.293l6.087-6.087a1 1 0 0 0 0-1.414z' fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'linear'
                    }}
                  />
                 
                  <div className="relative z-10">
                    <motion.div
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{
                          rotate: [0, 5, 0, -5, 0],
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Home className="h-10 w-10 text-white" />
                      </motion.div>
                     
                      <div>
                        <motion.h1
                          className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          Welcome Back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-200 dark:from-yellow-200 dark:to-amber-100">{user?.username || 'Client'}</span>!
                        </motion.h1>
                        <motion.p
                          className="text-blue-100 dark:text-blue-200 text-lg mt-2 max-w-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          Here's your project overview at a glance. You have <span className="font-semibold text-white bg-gradient-to-r from-blue-500/30 to-purple-500/30 px-2 py-0.5 rounded-lg">{orders.filter(o => o.status === 'in_progress').length} active projects</span> in progress.
                        </motion.p>
                      </div>
                    </motion.div>
                   
                    <motion.div
                      className="mt-6 flex flex-wrap gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 hover:bg-white/30 transition-all duration-200 cursor-default"
                      >
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 hover:bg-white/30 transition-all duration-200 cursor-default"
                      >
                        {orders.length} Total Orders
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-200 cursor-default"
                      >
                        <Sparkles className="h-3 w-3 inline mr-1" />
                        Premium Client
                      </motion.div>
                    </motion.div>
                  </div>
                 
                  {/* Animated background elements */}
                  <motion.div
                    className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut'
                    }}
                  />
                  <motion.div
                    className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                      delay: 2
                    }}
                  />
                </div>
              </motion.div>

              {/* Quick Actions with Staggered Animation */}
              <motion.div
                className="mb-8"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.h2
                  className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
                  variants={fadeInUp}
                >
                  <motion.span
                    className="h-1.5 w-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full"
                    animate={{
                      width: ['1.5rem', '3rem', '1.5rem'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                  Quick Actions
                </motion.h2>
               
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      to: "/client-dashboard/services",
                      icon: Box,
                      title: "Browse Services",
                      description: "Explore our offerings",
                      color: "blue",
                      iconBg: "from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500",
                      cardBg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
                      border: "border-blue-200 dark:border-blue-800/30",
                      index: 0
                    },
                    {
                      to: "/client-dashboard/orders",
                      icon: CreditCard,
                      title: "View Orders",
                      description: "Track your purchases",
                      color: "emerald",
                      iconBg: "from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500",
                      cardBg: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
                      border: "border-emerald-200 dark:border-emerald-800/30",
                      index: 1
                    },
                    {
                      to: "/client-dashboard/notifications",
                      icon: Bell,
                      title: "Notifications",
                      description: "Stay updated",
                      color: "purple",
                      iconBg: "from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500",
                      cardBg: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
                      border: "border-purple-200 dark:border-purple-800/30",
                      index: 2
                    },
                    {
                      to: "/client-dashboard/settings",
                      icon: Settings,
                      title: "Settings",
                      description: "Manage account",
                      color: "amber",
                      iconBg: "from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500",
                      cardBg: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
                      border: "border-amber-200 dark:border-amber-800/30",
                      index: 3
                    }
                  ].map((action) => (
                    <motion.div
                      key={action.to}
                      variants={fadeInUp}
                      custom={action.index * 0.1}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -8 }}
                    >
                      <Link
                        to={action.to}
                        className={`group relative overflow-hidden rounded-2xl p-5 ${action.cardBg} border ${action.border} hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 block`}
                      >
                        {/* Animated border on hover */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-transparent"
                          whileHover={{
                            borderColor: `var(--tw-${action.color}-500)`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {/* Animated background on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                            '--tw-gradient-from': `var(--tw-${action.color}-500)`,
                            '--tw-gradient-to': `var(--tw-${action.color}-600)`,
                            '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to)`
                          } as React.CSSProperties}
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 0.05 }}
                        />
                       
                        <div className="relative z-10">
                          <motion.div
                            className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.iconBg} flex items-center justify-center shadow-lg mb-4 group-hover:shadow-xl transition-all duration-300`}
                            whileHover={{ 
                              scale: 1.1,
                              rotate: [0, -5, 5, 0],
                            }}
                            transition={{ duration: 0.6 }}
                          >
                            <action.icon className="h-6 w-6 text-white" />
                          </motion.div>
                         
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            {action.description}
                          </p>
                         
                          <motion.div
                            className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            initial={{ x: -8 }}
                            whileHover={{ x: 0 }}
                          >
                            <ArrowRight className={`h-5 w-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                          </motion.div>
                        </div>
                       
                        {/* Subtle shine effect on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100"
                          initial={{ x: '-100%' }}
                          whileHover={{
                            x: '100%',
                            transition: { duration: 1, ease: 'easeInOut' }
                          }}
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Offers Section */}
              <OffersSection />
             
              {/* Enhanced Stats Grid with Theme Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ 
                      y: -8,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                    className={`group relative overflow-hidden rounded-2xl ${theme === 'dark' ? stat.darkBgColor : stat.bgColor} border ${stat.borderColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    {/* Animated border effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-transparent"
                      animate={{
                        borderColor: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0)'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            {stat.name}
                          </p>
                          <motion.p 
                            className="text-4xl font-black text-gray-900 dark:text-white drop-shadow-lg"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                          >
                            {stat.value}
                          </motion.p>
                          {stat.change && (
                            <div className="flex items-center gap-2 mt-3">
                              <motion.div
                                className="flex items-center gap-1 px-2.5 py-1 bg-white/25 dark:bg-gray-800/50 backdrop-blur-sm rounded-full"
                                whileHover={{ scale: 1.05 }}
                              >
                                {stat.changeType === 'increase' ? (
                                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                )}
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{stat.change}</span>
                              </motion.div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</span>
                            </div>
                          )}
                        </div>
                        <motion.div
                          className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                          whileHover={{ 
                            scale: 1.1,
                            rotate: 5
                          }}
                          animate={{
                            rotate: [0, 2, 0, -2, 0],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: index * 0.5,
                          }}
                        >
                          <stat.icon className="h-8 w-8 text-white drop-shadow" />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Floating particles */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-500/20 dark:bg-blue-400/20 rounded-full"
                        initial={{
                          x: Math.random() * 100,
                          y: Math.random() * 100,
                        }}
                        animate={{
                          y: [null, -20, 20, -20],
                          x: [null, 10, -10, 10],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </motion.div>
                ))}
              </motion.div>

              {/* Content Grid - Enhanced */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl"
                        animate={{
                          rotate: [0, 5, 0, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                        }}
                      >
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest updates from your projects</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => navigate('/client-dashboard/my-projects')}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                 
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="flex items-center p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 ${
                          activity.status === 'completed' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                          activity.status === 'pending' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                          'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {activity.status === 'completed' && <CheckCircle className="h-5 w-5" />}
                          {activity.status === 'pending' && <Clock className="h-5 w-5" />}
                          {activity.status === 'in-progress' && <Activity className="h-5 w-5" />}
                        </div>
                       
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{activity.action}</p>
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium ml-2 flex-shrink-0 ${
                                activity.status === 'completed' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                                activity.status === 'pending' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                                'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {activity.status}
                            </motion.span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.project}</p>
                        </div>
                       
                        <div className="ml-4 text-right flex-shrink-0">
                          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Performance Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden"
                >
                  {/* Animated border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-transparent"
                    animate={{
                      borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                  
                  <div className="mb-6 relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
                        animate={{
                          rotate: [0, 10, 0, -10, 0],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                        }}
                      >
                        <TrendingUp className="h-5 w-5 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-lg font-semibold">Performance Summary</h2>
                        <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">Overall metrics this month</p>
                      </div>
                    </div>
                  </div>
                 
                  <div className="space-y-6 relative z-10">
                    {(() => {
                      const totalOrders = orders.length;
                      const completedOrders = orders.filter(o => ['completed', 'closed', 'payment_done'].includes(o.status)).length;
                      const deliveredOrders = orders.filter(o => ['delivered', 'closed', 'payment_done'].includes(o.status)).length;
                     
                      const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
                      const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
                     
                      return [
                        { label: 'Project Completion', value: completionRate, color: 'from-blue-300 to-emerald-300' },
                        { label: 'On-time Delivery', value: deliveryRate, color: 'from-emerald-300 to-green-300' },
                        { label: 'Active Projects', value: orders.filter(o => ['in_progress', '25_done', '50_done', '75_done'].includes(o.status)).length, color: 'from-blue-300 to-indigo-300', isCount: true },
                      ].map((metric, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-blue-100 dark:text-blue-200">{metric.label}</span>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className="font-semibold"
                            >
                              {metric.isCount ? metric.value : `${metric.value}%`}
                            </motion.span>
                          </div>
                          {!metric.isCount && (
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ delay: 0.6 + index * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </div>
                          )}
                        </motion.div>
                      ));
                    })()}
                  </div>
                  
                  {/* Floating elements */}
                  <motion.div
                    className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              </div>
            </>
          )}
         
          {/* Dynamic Content Area with Animated Border */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            {/* Animated border effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-transparent pointer-events-none"
              animate={{
                borderColor: [
                  'rgba(59, 130, 246, 0)',
                  'rgba(59, 130, 246, 0.1)',
                  'rgba(59, 130, 246, 0)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
            <Outlet />
          </motion.div>
        </div>
      </motion.main>

      {/* Enhanced Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
       
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
       
        .animate-fadeIn {
          animation: fadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
       
        /* Theme transition animation */
        @keyframes theme-switch {
          0% {
            clip-path: circle(0% at 50% 50%);
          }
          100% {
            clip-path: circle(100% at 50% 50%);
          }
        }
        
        .theme-switch-animation {
          animation: theme-switch 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Gradient border animation */
        @keyframes border-glow {
          0%, 100% {
            border-color: rgba(59, 130, 246, 0.1);
          }
          50% {
            border-color: rgba(59, 130, 246, 0.3);
          }
        }
        
        /* Custom scrollbar for dark mode */
        .dark ::-webkit-scrollbar {
          width: 10px;
        }
        
        .dark ::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 5px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 5px;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        
        /* Focus styles */
        :focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

