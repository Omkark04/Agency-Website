import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { listOffers } from "@/api/offers";
import type { Offer } from "@/api/offers";
import { FiTag, FiArrowRight, FiClock, FiZap, FiStar } from "react-icons/fi";

// Simple theme context since we can't access the theme hook directly
const useTheme = () => {
  // This is a fallback - in a real app, use your theme context
  const isDark = typeof window !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  return { theme: isDark ? 'dark' : 'light' };
};

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.2, 0, 0, 1],
      delay: 0.15
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.7,
      ease: [0.2, 0, 0, 1],
      y: { 
        type: 'spring', 
        stiffness: 350, 
        damping: 22,
        mass: 0.5
      },
      opacity: { duration: 0.4 }
    }
  }),
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    transition: { 
      type: 'spring',
      stiffness: 450,
      damping: 18,
      mass: 0.6
    }
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
      when: 'beforeChildren',
      staggerDirection: 1
    }
  }
};

export default function OffersSection() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const resp = await listOffers({ limit: 10 }); // Fetch more to randomize
      const data: Offer[] = (resp.data && (resp.data.results ?? resp.data)) || [];
      
      // Shuffle and take 3 random offers
      const shuffled = Array.isArray(data) ? [...data].sort(() => 0.5 - Math.random()) : [];
      setOffers(shuffled.slice(0, 3));
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 overflow-hidden transition-colors duration-300">
        <div className="space-y-8">
        <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg w-1/3 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="h-80 bg-gradient-to-br from-gray-50 to-gray-50/80 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl border border-gray-100/80 dark:border-gray-700/50 overflow-hidden"
            >
              <div className="h-40 bg-gray-100 dark:bg-gray-700/50 animate-pulse"></div>
              <div className="p-6 space-y-4">
                <div className="h-5 bg-gray-100 dark:bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-5/6 animate-pulse"></div>
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="h-7 bg-gray-100 dark:bg-gray-700/50 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null; // Don't show section if no offers
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="bg-white/80 dark:bg-gray-800/70 rounded-3xl shadow-sm p-6 md:p-8 overflow-hidden transition-all duration-300 border border-gray-100/80 dark:border-gray-700/40 backdrop-blur-sm mb-8 hover:shadow-md hover:shadow-gray-100/50 dark:hover:shadow-gray-900/20 hover:border-gray-200/80 dark:hover:border-gray-600/40"
    >
      {/* HEADER */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-50/80 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl shadow-inner"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          >
            <FiZap className="text-blue-600 dark:text-blue-400 w-5 h-5" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Special Offers
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Limited time deals for you
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/offers")}
          className="group text-sm font-medium px-4 py-2.5 rounded-xl bg-gray-50/80 hover:bg-blue-50/80 dark:bg-gray-700/80 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all duration-200 flex items-center gap-2 border border-gray-200/60 dark:border-gray-600/40 hover:border-blue-200/60 dark:hover:border-blue-900/40"
        >
          <span>View All</span>
          <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={16} />
        </motion.button>
      </motion.div>

      {/* OFFERS CARDS */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {offers.map((offer, idx) => (
            <motion.div
              key={offer.id}
              custom={idx}
              variants={cardVariants}
              whileHover="hover"
              className="group relative bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/90 dark:to-gray-800/50 rounded-2xl border border-gray-100/80 dark:border-gray-700/40 overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col backdrop-blur-sm
                hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-100/90 dark:hover:border-blue-900/40
                hover:scale-[1.02] hover:z-10 hover:ring-1 hover:ring-blue-50/50 dark:hover:ring-blue-900/20"
              onClick={() => navigate("/dashboard/offers")}
            >
              {/* BADGE */}
              {offer.discount_value && (
                <motion.div 
                  className="absolute top-4 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-4 py-1.5 shadow-lg rounded-l-lg flex items-center z-10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <FiStar className="mr-1" size={12} />
                  {offer.discount_type === "percent"
                    ? `${offer.discount_value}% OFF`
                    : `₹${offer.discount_value} OFF`}
                </motion.div>
              )}

              <div className="p-6 pb-5 flex-1 flex flex-col relative z-0">
                {/* Animated gradient accent */}
                <motion.div 
                  className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent"
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileHover={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { duration: 0.5, ease: [0.2, 0, 0, 1] }
                  }}
                />
                <motion.div 
                  className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05), transparent 60%)'
                  }}
                />
                <motion.h3 
                  className="font-bold text-gray-900 dark:text-white text-lg mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 flex items-start"
                  whileHover={{ 
                    x: 2,
                    transition: { duration: 0.2 }
                  }}
                >
                  {offer.title}
                </motion.h3>
                
                <motion.p 
                  className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow leading-relaxed transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                  whileHover={{
                    x: 1,
                    transition: { duration: 0.2, delay: 0.05 }
                  }}
                >
                  {offer.short_description || offer.description}
                </motion.p>

                {/* PRICING */}
                {offer.discounted_price && (
                  <motion.div 
                    className="mt-auto pt-4 border-t border-gray-100/80 dark:border-gray-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <motion.div 
                      className="flex items-baseline gap-2"
                      whileHover={{
                        scale: 1.02,
                        transition: { 
                          type: 'spring',
                          stiffness: 500,
                          damping: 15
                        }
                      }}
                    >
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                        ₹{offer.discounted_price}
                      </span>
                      {offer.original_price && (
                        <motion.span 
                          className="text-sm text-gray-400 dark:text-gray-500 line-through"
                          initial={{ opacity: 0.8, x: -5 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                        >
                          ₹{offer.original_price}
                        </motion.span>
                      )}
                    </motion.div>
                    <motion.div 
                      className="flex items-center text-xs text-blue-500 dark:text-blue-400 mt-2 font-medium group/clock"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{
                        scale: 1.03,
                        x: 2,
                        transition: { 
                          type: 'spring',
                          stiffness: 500,
                          damping: 15
                        }
                      }}
                    >
                      <motion.span 
                        animate={{ 
                          scale: [1, 1.15, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          repeatType: 'reverse',
                          duration: 2.5,
                          ease: 'easeInOut',
                          times: [0, 0.3, 0.7, 1]
                        }}
                        className="inline-block group-hover/clock:text-blue-600 dark:group-hover/clock:text-blue-300 transition-colors"
                      >
                        <FiClock className="mr-1.5 inline-block" size={14} />
                      </motion.span>
                      <motion.span
                        className="relative"
                      >
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent opacity-0 group-hover/clock:opacity-100 transition-opacity duration-300"
                          initial={{ opacity: 0 }}
                        >
                          Limited time offer
                        </motion.span>
                        <span className="opacity-100 group-hover/clock:opacity-0 transition-opacity duration-300">
                          Limited time offer
                        </span>
                      </motion.span>
                    </motion.div>
                  </motion.div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100/80 dark:border-gray-700/50">
                  <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    Learn more
                    <FiArrowRight className="ml-1.5 transition-transform group-hover:translate-x-1" size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
