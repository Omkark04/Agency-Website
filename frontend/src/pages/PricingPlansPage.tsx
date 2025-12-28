import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, Home, LayoutDashboard, Search, X, Filter,
  ChevronRight, ArrowLeft, Sparkles, Clock, RefreshCw, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listPriceCards } from '../api/pricecards';
import type { PriceCard } from '../api/pricecards';
import { listServices } from '../api/services';
import type { Service } from '../api/services';
import { useProtectedNavigation } from '../hooks/useProtectedNavigation';
import { Button as MovingBorderContainer } from "@/components/ui/moving-border";
import DynamicFormRenderer from '../components/forms/DynamicFormRenderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SEOHead } from '../components/shared/SEOHead';

export default function PricingPlansPage() {
  const [cards, setCards] = useState<PriceCard[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'medium' | 'premium' | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });
  const [showFilters, setShowFilters] = useState(false);

  // Modal state for form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceCard, setSelectedPriceCard] = useState<PriceCard | null>(null);
  const [modalService, setModalService] = useState<Service | null>(null);

  const navigate = useNavigate();
  const { navigateTo } = useProtectedNavigation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, servicesRes] = await Promise.all([
        listPriceCards(),
        listServices({ is_active: true })
      ]);
      setCards(cardsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(
    new Map(services.map(s => [s.department, { id: s.department, name: s.department_title || 'Department' }])).values()
  );

  const filteredServices = selectedDepartment
    ? services.filter(s => s.department === selectedDepartment)
    : services;

  const filteredCards = cards.filter(card => {
    const service = services.find(s => s.id === card.service);
    const searchMatch = !searchQuery || 
      service?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service?.department_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const deptMatch = !selectedDepartment || service?.department === selectedDepartment;
    const serviceMatch = !selectedService || card.service === selectedService;
    const tierMatch = !selectedTier || card.title === selectedTier;
    const price = parseFloat(card.price);
    const priceMatch = price >= priceRange.min && price <= priceRange.max;

    return searchMatch && deptMatch && serviceMatch && tierMatch && priceMatch;
  });

  const getServiceName = (serviceId: number) => {
    return services.find(s => s.id === serviceId)?.title || 'Unknown Service';
  };

  const getDepartmentName = (serviceId: number) => {
    return services.find(s => s.id === serviceId)?.department_title || 'Unknown Department';
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment(null);
    setSelectedService(null);
    setSelectedTier(null);
    setPriceRange({ min: 0, max: 1000000 });
  };

  // Handler to open form with pre-selected price card
  const openFormWithPriceCard = (card: PriceCard) => {
    const service = services.find(s => s.id === card.service);
    if (!service) return;
    
    setSelectedPriceCard(card);
    setModalService(service);
    setIsModalOpen(true);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPriceCard(null);
    setModalService(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2A8]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Pricing Plans"
        description="Choose the perfect plan for your business needs. Transparent pricing for web development, design, and digital marketing services."
        url="/pricing-plans"
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden py-12">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
          {/* Header with Navigation */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </button>

              {user && (
                <button
                  onClick={() => navigateTo('/client-dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-full hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:shadow-lg transition-all duration-300 md:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-[#00C2A8]/20 to-[#0066FF]/20 text-[#00C2A8] dark:text-[#00C2A8] text-sm font-semibold mb-4">
              <Sparkles className="inline-block w-4 h-4 mr-2" />
              Complete Catalog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              All Pricing Plans
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
              Explore all our pricing options and find the perfect plan for your needs
            </p>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-xl border border-gray-200 dark:border-gray-700 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services, departments, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#00C2A8] focus:ring-4 focus:ring-[#00C2A8]/20 transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment || ''}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value ? Number(e.target.value) : null);
                    setSelectedService(null);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]/30 focus:border-[#00C2A8] transition-all duration-300"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service
                </label>
                <select
                  value={selectedService || ''}
                  onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]/30 focus:border-[#00C2A8] transition-all duration-300"
                >
                  <option value="">All Services</option>
                  {filteredServices.map(service => (
                    <option key={service.id} value={service.id}>{service.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tier
                </label>
                <select
                  value={selectedTier || ''}
                  onChange={(e) => setSelectedTier(e.target.value as any || null)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]/30 focus:border-[#00C2A8] transition-all duration-300"
                >
                  <option value="">All Tiers</option>
                  <option value="basic">Basic</option>
                  <option value="medium">Medium</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={priceRange.max === 1000000 ? '' : priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value ? Number(e.target.value) : 1000000 })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]/30 focus:border-[#00C2A8] transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-6 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>

          {/* Results Counter */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 rounded-full">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Found {filteredCards.length} plan{filteredCards.length !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Pricing Cards Grid */}
          {filteredCards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl mb-6">
                <Sparkles className="w-16 h-16 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Plans Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                {searchQuery
                  ? `No plans match "${searchQuery}". Try different keywords or clear the search.`
                  : 'Try adjusting your filters to see more plans.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCards.map((card, index) => {
                const isPopular = card.title === 'medium';

                return (
                  <motion.div
                    key={card.id}
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="relative z-0"
                  >
                    <MovingBorderContainer
                      borderRadius="1rem"
                      containerClassName="w-full h-full bg-transparent p-[3px]"
                      className="bg-white dark:bg-gray-800 border-neutral-200 dark:border-gray-700 p-0 overflow-hidden items-start justify-start flex-col h-full w-full"
                      duration={Math.floor(Math.random() * 2000) + 2000}
                      as="div"
                    >
                      <div className="group relative w-full h-full">
                        {/* Popular Badge */}
                        {isPopular && (
                          <div className="absolute top-4 left-4 z-10">
                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                              <Star className="w-3 h-3 fill-current" />
                              MOST POPULAR
                            </div>
                          </div>
                        )}

                        {/* Tier Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                            card.title === 'basic' 
                              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400'
                              : card.title === 'medium'
                              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400'
                              : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400'
                          }`}>
                            {card.title}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 pt-16">
                          {/* Department Tag */}
                          <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-xs font-semibold mb-3">
                            {getDepartmentName(card.service)}
                          </div>

                          {/* Service Name */}
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 line-clamp-1">
                            {getServiceName(card.service)}
                          </h3>

                          {/* Price */}
                          <div className="mb-6">
                            <div className="text-4xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              ₹{parseFloat(card.price).toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#00C2A8]" />
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Delivery</div>
                                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                                  {card.delivery_days || 7} days
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 text-[#0066FF]" />
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Revisions</div>
                                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                                  {card.revisions}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {card.description && (
                            <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
                              {card.description}
                            </p>
                          )}

                          {/* Features */}
                          {card.features && card.features.length > 0 && (
                            <div className="mb-6">
                              <ul className="space-y-3">
                                {card.features.slice(0, 4).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-600 dark:text-green-400 stroke-[3]" />
                                      </div>
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {feature}
                                    </span>
                                  </li>
                                ))}
                                {card.features.length > 4 && (
                                  <li className="text-sm text-[#00C2A8] dark:text-[#00C2A8] font-medium ml-7">
                                    +{card.features.length - 4} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* CTA Button */}
                          <button
                            onClick={() => openFormWithPriceCard(card)}
                            className={`w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group ${
                              card.title === 'basic'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30'
                                : card.title === 'medium'
                                ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:shadow-lg hover:shadow-[#00C2A8]/30'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30'
                            }`}
                          >
                            Get Started
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </MovingBorderContainer>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Service Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent">
          {modalService && selectedPriceCard && (
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
                        {modalService.title}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        Complete your service request
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6">
                  {/* Selected Plan Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-300">Selected Plan</h3>
                        <p className="text-blue-700 dark:text-blue-400 text-sm mt-1 capitalize">
                          {selectedPriceCard.title} • ₹{parseFloat(selectedPriceCard.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Change Plan
                      </button>
                    </div>
                  </motion.div>

                  {/* Dynamic Form */}
                  <DynamicFormRenderer
                    serviceId={modalService.id}
                    priceCardId={selectedPriceCard.id}
                    onSuccess={handleCloseModal}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
