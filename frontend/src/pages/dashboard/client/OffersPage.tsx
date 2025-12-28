import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listOffers } from "../../../api/offers";
import type { Offer } from "../../../api/offers";
import { FiTag, FiClock, FiArrowRight, FiFilter, FiX, FiSearch } from "react-icons/fi";
import { useTheme } from "next-themes";

const categoryFilters = [
  { id: 'all', label: 'All Offers' },
  { id: 'special', label: 'Special Offers' },
  { id: 'regular', label: 'Regular Offers' },
  { id: 'featured', label: 'Featured' },
  { id: 'ending-soon', label: 'Ending Soon' },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    fetchOffers();
  }, [selectedCategories]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (!selectedCategories.includes('all')) {
        params.offer_category = selectedCategories.join(',');
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const resp = await listOffers(params);
      const data: Offer[] = (resp.data && (resp.data.results ?? resp.data)) || [];
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.includes(categoryId)
          ? prev.filter(id => id !== categoryId)
          : [...prev.filter(id => id !== 'all'), categoryId];
        return newSelection.length === 0 ? ['all'] : newSelection;
      });
    }
  };

  const clearFilters = () => {
    setSelectedCategories(['all']);
    setSearchQuery('');
  };

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <FiTag className="inline mr-3 text-blue-500" />
                Special Offers
              </h1>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Explore our exclusive deals and save on your next project
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`relative flex-1 max-w-md ${isDarkMode ? 'bg-slate-700' : 'bg-white'} rounded-xl shadow-sm`}>
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchOffers()}
                  placeholder="Search offers..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 text-white placeholder-slate-400' : 'bg-white text-gray-900'}`}
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      fetchOffers();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-50'} shadow-sm transition-colors`}
              >
                <FiFilter className={isFilterOpen ? 'text-blue-500' : 'text-slate-500'} />
                <span className={`hidden sm:inline ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                  Filters
                </span>
              </button>
            </div>
          </div>

          {/* FILTERS DROPDOWN */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`mt-4 overflow-hidden rounded-xl shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filter by category</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => toggleCategory(filter.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategories.includes(filter.id)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : isDarkMode
                            ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* OFFERS GRID */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className={`mt-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} mb-6`}>
              <FiTag className="text-4xl text-blue-500" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No offers found</h3>
            <p className={`max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              We couldn't find any offers matching your criteria. Try adjusting your filters or check back later.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {offers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-750 shadow-lg hover:shadow-xl hover:shadow-blue-500/10' 
                    : 'bg-white hover:shadow-xl hover:shadow-blue-100'
                }`}
              >
                {/* IMAGE */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                  {(offer.imageURL || offer.image) ? (
                    <div className="w-full h-full">
                      <img
                        src={(offer.imageURL || offer.image) || undefined}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
                      <FiTag size={64} className="text-white/20" />
                    </div>
                  )}
                  
                  {/* BADGES */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      {/* CATEGORY BADGE */}
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                        offer.offer_category === "special"
                          ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      }`}>
                        {offer.offer_category === "special" ? "Special" : "Regular"}
                      </span>
                      
                      {/* DISCOUNT BADGE */}
                  {offer.discount_value && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                      {offer.discount_type === "percent"
                        ? `Save ${offer.discount_value}%`
                        : `Save ₹${offer.discount_value}`}
                    </div>
                  )}
                    </div>
                    
                    {/* TIME REMAINING */}
                    {offer.remaining_days !== null && offer.remaining_days !== undefined && (
                      <div className="flex justify-end">
                        <div className="bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <FiClock className="text-yellow-300" size={12} />
                          <span>
                            {offer.remaining_days > 0
                              ? `${offer.remaining_days} day${offer.remaining_days > 1 ? 's' : ''} left`
                              : 'Expired'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className={`text-lg font-bold mb-2 line-clamp-2 h-14 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {offer.title}
                      </h3>
                      
                      <p className={`text-sm mb-4 line-clamp-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        {offer.short_description || offer.description}
                      </p>
                      
                      {/* PRICING */}
                      {offer.discounted_price && (
                        <div className="mb-4">
                          <div className="flex items-baseline">
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              ₹{offer.discounted_price}
                            </span>
                            {offer.original_price && (
                              <span className={`ml-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} line-through`}>
                                ₹{offer.original_price}
                              </span>
                            )}
                            {offer.discount_value && offer.discount_type === 'percent' && (
                              <span className="ml-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                {offer.discount_value}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* FEATURES */}
                      {offer.features && offer.features.length > 0 && (
                        <ul className="mt-3 space-y-2 mb-5">
                          {offer.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className={`flex items-start text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                              <svg className="flex-shrink-0 w-4 h-4 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {/* CTA BUTTON */}
                    <a
                      href={offer.cta_link || `/offers/${offer.slug || offer.id}`}
                      className="w-full mt-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-center py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
                    >
                      {offer.cta_text || "Claim This Offer"}
                      <FiArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

