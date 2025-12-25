import { useState, useEffect } from 'react';
import { listServices } from '../../../api/services';
import type { Service } from '../../../api/services';
import EmptyState from '../../../components/EmptyState';
import PriceCardSelector from '../../../components/PriceCardSelector';
import DynamicFormRenderer from '../../../components/forms/DynamicFormRenderer';




import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Search,
  ChevronDown,
  X,
  ArrowLeft,
  Sparkles,
  Clock,
  Rocket,
  Filter,
  LayoutGrid,
  List,
  Globe,
  Smartphone,
  Palette,
  Code,
  BarChart,
  Heart,
  Bookmark,
  Eye,
  LineChart,
  ShieldCheck,
  Trophy,
  BadgeCheck} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';




// Floating particles system
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.3}s`,
          animationDuration: `${10 + Math.random() * 15}s`,
        }}
      />
    ))}
  </div>
);




// Premium Service Card Component
const ServiceCard = ({ service, onSelect, index }: { service: Service; onSelect: () => void; index: number }) => {
  const [, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);




  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'web': Globe,
      'mobile': Smartphone,
      'design': Palette,
      'development': Code,
      'marketing': BarChart,
      'analytics': LineChart,
    };
    return icons[category.toLowerCase()] || Globe;
  };




  const CategoryIcon = getCategoryIcon(service.department_title || '');




  return (
    <motion.div
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
        y: -12,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Animated background gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
     
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
        {/* Floating particles */}
        <FloatingParticles />
       
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 transition-all duration-700 rounded-3xl" />
       
        {/* Top right corner actions */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
          </motion.button>
         
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </motion.button>
        </div>




        {/* Featured badge */}
        {service.is_featured && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute -top-3 -left-3"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl blur" />
              <div className="relative flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-xl">
                <Star className="w-3 h-3 mr-1.5 fill-current" />
                FEATURED
              </div>
            </div>
          </motion.div>
        )}




        {/* Category icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
          className="mb-5 relative"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-lg">
            <CategoryIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>




        {/* Service title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="mb-3"
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-500">
            {service.title}
            <Sparkles className="inline w-4 h-4 ml-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </h3>
         
          {/* Category badge */}
          {service.department_title && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 rounded-full mt-2 border border-blue-200 dark:border-blue-700/50 backdrop-blur-sm"
            >
              {service.department_title}
            </motion.span>
          )}
        </motion.div>




        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-2 leading-relaxed"
        >
          {service.short_description}
        </motion.p>




        {/* Features with staggered animation */}
        {service.features && service.features.length > 0 && (
          <motion.div
            className="space-y-2 mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: index * 0.1 + 0.6
                }
              }
            }}
          >
            {service.features.slice(0, 3).map((feature, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="flex items-center text-sm"
              >
                <div className="p-1.5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg mr-3 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 truncate">{feature.title}</span>
              </motion.div>
            ))}
          </motion.div>
        )}




        {/* Price section with animated glow */}
        {service.original_price && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.7 }}
            className="relative mb-6"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm mr-3">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Starting from</div>
                    <div className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      ₹{service.original_price.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-xs px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold">
                  Best Value
                </div>
              </div>
            </div>
          </motion.div>
        )}




        {/* Action button with hover effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Button
            onClick={onSelect}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
           
            <span className="relative">Request Service</span>
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 relative" />
          </Button>
        </motion.div>




        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.9 }}
          className="mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center">
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            <span>1.2k views</span>
          </div>
          <div className="flex items-center">
            <Star className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            <span>4.8</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};




// Premium Service List Item Component
const ServiceListItem = ({ service, onSelect, index }: { service: Service; onSelect: () => void; index: number }) => {
  const [, setIsHovered] = useState(false);




  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Hover background */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
     
      <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {/* Service logo with animation */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {service.logo ? (
                <>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src={service.logo}
                    alt={service.title}
                    className="relative w-14 h-14 rounded-xl shadow-lg"
                  />
                </>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Globe className="w-7 h-7 text-white" />
                </div>
              )}
            </motion.div>




            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {service.title}
                </h3>
                {service.is_featured && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </motion.div>
                )}
              </div>
             
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-1">
                {service.short_description}
              </p>
             
              <div className="flex items-center space-x-4">
                {service.original_price && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/50"
                  >
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1.5" />
                    <span className="font-bold text-gray-900 dark:text-white">₹{service.original_price.toLocaleString()}</span>
                  </motion.div>
                )}
               
                {service.department_title && (
                  <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                    {service.department_title}
                  </span>
                )}
               
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Star className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  <span>4.8</span>
                </div>
              </div>
            </div>
          </div>
         
          {/* Action button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onSelect}
              className="flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:translate-x-1"
            >
              Request
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};




// Premium Stats Component
const PremiumStats = ({ services }: { services: Service[] }) => {
  const stats = [
    {
      id: 1,
      title: "Total Services",
      value: services.length,
      icon: Rocket,
      color: "from-blue-500 to-cyan-500",
      change: "+12%",
      trend: "up"
    },
    {
      id: 2,
      title: "Avg. Rating",
      value: "4.8/5",
      icon: Star,
      color: "from-amber-500 to-orange-500",
      change: "+0.2",
      trend: "up"
    },
    {
      id: 3,
      title: "Client Satisfaction",
      value: "98%",
      icon: ShieldCheck,
      color: "from-emerald-500 to-green-500",
      change: "+3%",
      trend: "up"
    },
    {
      id: 4,
      title: "Support Available",
      value: "24/7",
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      change: "Always",
      trend: "stable"
    }
  ];




  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          {/* Animated background */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
         
          <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{stat.title}</p>
                <div className="flex items-baseline">
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <span className={`ml-3 text-sm font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
           
            {/* Animated progress bar */}
            <div className="mt-4 h-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: index * 0.1 + 0.5, duration: 1.5 }}
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};




// Premium Filter Component
const PremiumFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
  services
}: any) => {
  const [showCategories, setShowCategories] = useState(false);
  const categories = Array.from(new Set(services.map((s: Service) => s.department_title))).filter((cat): cat is string => Boolean(cat));




  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      {/* Background gradient */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl blur-2xl" />
     
      <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Discover Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Browse our premium collection of professional services
            </p>
          </div>
         
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Premium Search */}
            <div className="relative flex-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-xl blur opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search services, features, or categories..."
                  className="pl-12 pr-10 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg focus:shadow-2xl transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>




            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                <span>Category</span>
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>
             
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setCategoryFilter('all');
                          setShowCategories(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat: string) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setCategoryFilter(cat);
                            setShowCategories(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === cat ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>




            {/* View Toggle */}
            <div className="flex items-center border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>




        {/* Active Filters */}
        {(searchQuery || categoryFilter !== 'all') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {searchQuery && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-300"
              >
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-2 p-0.5 rounded hover:bg-white/20">
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            )}
            {categoryFilter !== 'all' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300"
              >
                Category: {categoryFilter}
                <button onClick={() => setCategoryFilter('all')} className="ml-2 p-0.5 rounded hover:bg-white/20">
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};




// Premium Header Component
const PremiumHeader = ({ }: { services: Service[] }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 border-b border-gray-200/50 dark:border-gray-700/30">
      <FloatingParticles />
     
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 animate-gradient" />
     
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-4">
            Premium Services
            <Rocket className="inline w-10 h-10 ml-4 text-blue-500 animate-float" />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Discover our curated collection of professional services designed to elevate your business
          </p>
         
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <div className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/30 dark:border-emerald-700/30">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Secure & Trusted</span>
            </div>
            <div className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/30 dark:border-amber-700/30">
              <Trophy className="w-4 h-4 text-amber-500 mr-2" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Award Winning</span>
            </div>
            <div className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/30 dark:border-cyan-700/30">
              <BadgeCheck className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Premium Quality</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};




const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 
  const [modalStep, setModalStep] = useState<'select-plan' | 'fill-form'>('select-plan');
  const [selectedPriceCard, setSelectedPriceCard] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);




  useEffect(() => {
    fetchData();
  }, []);




  const fetchData = async () => {
    try {
      setLoading(true);
      const servicesRes = await listServices({ is_active: true });
      setServices(servicesRes.data || []);
    } catch (err) {
      setError('Failed to load services');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };




  const openServiceModal = async (service: Service) => {
    try {
      setSelectedService(service);
      setFormLoading(true);
      setIsModalOpen(true);
     
      if (!service.id) {
        throw new Error('Service ID is required');
      }
     
     
      setModalStep('select-plan');
    } catch (error: any) {
      console.error('Failed to fetch service form:', error);
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'No custom form available for this service. Please contact support.';
      alert(errorMessage);
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };




  const handlePriceCardSelect = (priceCard: any) => {
    setSelectedPriceCard(priceCard);
    setModalStep('fill-form');
  };




  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStep('select-plan');
    setSelectedPriceCard(null);
    setSelectedService(null);
  };




  const handleBackToPriceSelection = () => {
    setModalStep('select-plan');
    setSelectedPriceCard(null);
  };




  const filteredServices = services.filter(service => {
    const matchesSearch = searchQuery === '' ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
   
    const matchesCategory = categoryFilter === 'all' || service.department_title === categoryFilter;
   
    return matchesSearch && matchesCategory;
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
            <Rocket className="w-16 h-16 text-blue-500" />
          </motion.div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading premium services...</p>
        </div>
      </div>
    );
  }




  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon="alert"
          title="Error loading services"
          description={error}
          action={{
            label: 'Try Again',
            onClick: fetchData
          }}
        />
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10">
      <FloatingParticles />
     
      {/* Premium Header */}
      <PremiumHeader services={services} />




      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Premium Stats */}
        <PremiumStats services={services} />




        {/* Premium Filters */}
        <PremiumFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          services={services}
        />




        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-20 bg-gradient-to-br from-white/90 to-gray-100/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl"
          >
            <Search className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-float-slow" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              No services found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for
            </p>
            <Button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
            >
              Clear all filters
            </Button>
          </motion.div>
        ) : viewMode === 'list' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredServices.map((service, index) => (
              <ServiceListItem
                key={service.id}
                service={service}
                onSelect={() => openServiceModal(service)}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={() => openServiceModal(service)}
                index={index}
              />
            ))}
          </motion.div>
        )}




        {/* Service Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6 text-center">
            Browse by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from(new Set(services.map(s => s.department_title))).filter(Boolean).map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCategoryFilter(category!)}
                className={`p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${categoryFilter === category ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-200 dark:border-blue-700' : 'bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-700'}`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{category}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {services.filter(s => s.department_title === category).length} services
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>




      {/* Premium Service Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent">
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl rounded-3xl shadow-3xl overflow-hidden"
            >
              {/* Modal header gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
             
              <div className="p-6">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {selectedService.title}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        {modalStep === 'select-plan' ? 'Choose your perfect plan' : 'Complete your service request'}
                      </DialogDescription>
                    </div>
                   
                    {selectedService.is_featured && (
                      <div className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg">
                        <Star className="w-4 h-4 mr-2 fill-current" />
                        Premium Service
                      </div>
                    )}
                  </div>
                </DialogHeader>




                {formLoading ? (
                  <div className="py-16 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <Rocket className="w-12 h-12 text-blue-500" />
                    </motion.div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading service details...</p>
                  </div>
                ) : (
                  <div className="mt-6">
                    {modalStep === 'select-plan' ? (
                      <PriceCardSelector
                        serviceId={selectedService.id}
                        onSelect={handlePriceCardSelect}
                        onCancel={handleCloseModal}
                      />
                    ) : (
                      <div>
                        {/* Selected Plan Summary */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/50 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-blue-900 dark:text-blue-300">Selected Plan</h3>
                              <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                                {selectedPriceCard?.title} • ₹{selectedPriceCard?.price?.toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={handleBackToPriceSelection}
                              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Change Plan
                            </button>
                          </div>
                        </motion.div>




                        {/* Custom Form */}
                        {selectedService && selectedService.id ? (
                          <DynamicFormRenderer
                            serviceId={selectedService.id}
                            priceCardId={selectedPriceCard?.id}
                            onSuccess={(orderId) => {
                              alert(`Service request submitted successfully! Order #${orderId} created.`);
                              handleCloseModal();
                            }}
                          />
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-gray-500">No form available for this service</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>




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




        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
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
};




export default ServicesPage;
