import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, Home, LayoutDashboard, Search, X, Filter,
  ChevronRight, ArrowLeft, Sparkles, Clock, RefreshCw, Star,
  Globe, Smartphone, Palette, Code, BarChart, LineChart, Eye
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listPriceCards } from '../api/pricecards';
import type { PriceCard } from '../api/pricecards';
import { listServices } from '../api/services';
import type { Service } from '../api/services';
import { fetchDesktopPriceHeroImages, fetchMobilePriceHeroImages, type MediaItem } from '../api/media';
import { AnimatePresence } from 'framer-motion';
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
import { useAuth } from '../hooks/useAuth';
import IntroAnimation from '../components/animations/IntroAnimation';
import { useIntro } from '../context/IntroContext';

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

  // Header Images State
  const [desktopImages, setDesktopImages] = useState<MediaItem[]>([]);
  const [mobileImages, setMobileImages] = useState<MediaItem[]>([]);
  const [currentDesktopIndex, setCurrentDesktopIndex] = useState(0);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);

  // Modal state for form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceCard, setSelectedPriceCard] = useState<PriceCard | null>(null);
  const [modalService, setModalService] = useState<Service | null>(null);

  // Modal state for Service Details (Eye Button)
  const [detailService, setDetailService] = useState<Service | null>(null);

  // Modal state for viewing all features of a card
  const [selectedCardForFeatures, setSelectedCardForFeatures] = useState<PriceCard | null>(null);

  const navigate = useNavigate();
  const { navigateTo } = useProtectedNavigation();
  const { user } = useAuth();
  const { hasViewedPricingIntro, setHasViewedPricingIntro } = useIntro();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showIntro, setShowIntro] = useState(!hasViewedPricingIntro);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setHasViewedPricingIntro(true);
  };

  useEffect(() => {
    fetchData();
    
    // Read department or service from URL query parameter
    const deptParam = searchParams.get('department');
    const serviceParam = searchParams.get('service');

    if (serviceParam) {
      setSelectedService(Number(serviceParam));
    } else if (deptParam) {
      setSelectedDepartment(Number(deptParam));
    }
  }, []);

  // Auto-rotate desktop images
  useEffect(() => {
    if (desktopImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentDesktopIndex((prev) => (prev + 1) % desktopImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [desktopImages.length]);

  // Auto-rotate mobile images
  useEffect(() => {
    if (mobileImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMobileIndex((prev) => (prev + 1) % mobileImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mobileImages.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, servicesRes, desktopImgs, mobileImgs] = await Promise.all([
        listPriceCards(),
        listServices({ is_active: true }),
        fetchDesktopPriceHeroImages(),
        fetchMobilePriceHeroImages()
      ]);
      setCards(cardsRes.data);
      setServices(servicesRes.data);
      setDesktopImages(desktopImgs);
      setMobileImages(mobileImgs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(
    new Map(services.map(s => [s.department, { id: s.department, name: s.department_title || 'Department' }])).values()
  );

  const filteredServices = services.filter(service => {
    // 1. Filter by Department
    if (selectedDepartment && service.department !== selectedDepartment) return false;
    
    // 2. Filter by Search Query (Service Name or Department Name)
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = service.title.toLowerCase().includes(query);
        const deptMatch = service.department_title?.toLowerCase().includes(query);
        if (!titleMatch && !deptMatch) return false;
    }

    // 3. Filter by Selected Service (Dropdown)
    if (selectedService && service.id !== selectedService) return false;

    return true;
  });

  const getServiceCards = (serviceId: number) => {
    return cards.filter(card => {
        if (card.service !== serviceId) return false;

        // Apply Card-Specific Filters
        // 1. Tier
        if (selectedTier && card.title !== selectedTier) return false;

        // 2. Price Range
        const price = parseFloat(card.price);
        if (price < priceRange.min || price > priceRange.max) return false;

        return true;
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment(null);
    setSelectedService(null);
    setSelectedTier(null);
    setPriceRange({ min: 0, max: 1000000 });
    // Clear URL query parameters
    setSearchParams({});
  };

  const openFormWithPriceCard = (card: PriceCard) => {
    const service = services.find(s => s.id === card.service);
    if (!service) return;
    
    setSelectedPriceCard(card);
    setModalService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPriceCard(null);
    setModalService(null);
  };

  const handleCloseDetailModal = () => {
    setDetailService(null);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'web': Globe,
      'mobile': Smartphone,
      'design': Palette,
      'development': Code,
      'marketing': BarChart,
      'analytics': LineChart,
    };
    return icons[category?.toLowerCase()] || Globe;
  };

  const renderServiceContent = (service: Service, isModal: boolean = false) => {
      const CategoryIcon = getCategoryIcon(service.department_title || '');
      
      return (
          <>
            <div className={`relative flex flex-col md:flex-row gap-6 md:items-start mb-6 ${isModal ? '' : 'md:mb-8'}`}>
                {/* Eye Button - Absolute Top Right on Mobile */}
                {!isModal && (
                     <button
                        onClick={() => setDetailService(service)}
                        className="md:hidden absolute top-0 right-0 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                        aria-label="View Service Details"
                     >
                         <Eye className="w-5 h-5" />
                     </button>
                )}

                <div className="flex flex-row md:flex-col gap-4 md:gap-0 items-center md:items-start">
                    <div className="flex-shrink-0 relative">
                        {service.logo ? (
                            <div className="p-2 md:p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-sm">
                                    <img 
                                      src={service.logo} 
                                      alt={service.title} 
                                      width="80"
                                      height="80"
                                      className="w-12 h-12 md:w-20 md:h-20 object-contain" 
                                    />
                            </div>
                        ) : (
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#00C2A8]/10 to-[#0066FF]/10 flex items-center justify-center">
                                <CategoryIcon className="w-6 h-6 md:w-8 md:h-8 text-[#0066FF]" />
                            </div>
                        )}
                    </div>
                    {/* Mobile: Title next to logo. Desktop: Title separate via flex-cols swap or implicit flow */}
                     <div className="md:hidden flex-1 pr-10"> {/* pr-10 to avoid overlap with absolute eye button */}
                        <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1 break-words">
                            {service.title}
                        </h2>
                         <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {service.department_title}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {/* Desktop Title Area - Hidden on Mobile since we show it next to logo above */}
                    <div className="hidden md:flex items-center justify-between gap-3 mb-2 flex-wrap">
                         <div className="flex items-center gap-3 flex-wrap">
                            <h2 className={`font-bold text-gray-900 dark:text-white break-words ${isModal ? 'text-2xl' : 'text-3xl'}`}>
                                {service.title}
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {service.department_title}
                            </span>
                         </div>
                    </div>

                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 font-medium whitespace-normal break-words mt-2 md:mt-0">
                        {service.short_description}
                    </p>
                    
                    <div className={`prose prose-sm dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 whitespace-normal break-words ${isModal ? 'block' : 'hidden md:block'}`}>
                        <p>{service.long_description}</p>
                    </div>
                </div>
            </div>
          </>
      );
  };


  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation
            onComplete={handleIntroComplete}
            title="Our Services"
            subtitle={null}
            duration={2000}
          />
        )}
      </AnimatePresence>
      <SEOHead 
        title="Pricing Plans"
        description="Choose the perfect plan for your business needs. Transparent pricing for web development, design, and digital marketing services."
        url="/pricing-plans"
      />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
             <div className="flex flex-col items-center gap-4">
                 <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-t-[#00C2A8] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 </div>
                 <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading Plans...</p>
             </div>
         </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        
        {/* New Hero Section */}
        <div className="relative w-full border-b border-gray-200 dark:border-gray-800 mb-8 md:mb-12 overflow-hidden aspect-square md:aspect-auto md:h-[50vh]">
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
                {/* Desktop Carousel */}
                <div className="hidden md:block w-full h-full relative">
                    <AnimatePresence mode="wait">
                        {desktopImages.length > 0 ? (
                            <motion.img
                                key={currentDesktopIndex}
                                src={desktopImages[currentDesktopIndex].url}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div key="desktop-gradient" className="w-full h-full bg-gradient-to-r from-[#00C2A8]/10 via-[#0066FF]/10 to-purple-500/10" />
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile Carousel */}
                 <div className="md:hidden w-full h-full relative">
                    <AnimatePresence mode="wait">
                        {mobileImages.length > 0 ? (
                            <motion.img
                                key={currentMobileIndex}
                                src={mobileImages[currentMobileIndex].url}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div key="mobile-gradient" className="w-full h-full bg-gradient-to-r from-[#00C2A8]/10 via-[#0066FF]/10 to-purple-500/10" />
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16 md:py-20 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                 >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-[#00C2A8] text-sm font-semibold mb-6 shadow-sm">
                        <Sparkles className="inline-block w-4 h-4 mr-2" />
                        {selectedDepartment 
                          ? departments.find(d => d.id === selectedDepartment)?.name || 'Complete Catalog'
                          : 'Complete Catalog'
                        }
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6 leading-tight pb-4">
                        {selectedDepartment 
                          ? `${departments.find(d => d.id === selectedDepartment)?.name} Plans`
                          : 'All Pricing Plans'
                        }
                    </h1>
                    {selectedDepartment && (
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm"
                      >
                        <X className="w-4 h-4" />
                        Clear Filter
                      </button>
                    )}
                 </motion.div>
            </div>
        </div>


        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl pb-20">
          
          {/* Header Controls */}
           <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </button>

              {user && (
                <button
                  onClick={() => navigateTo('/client-dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-full hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:shadow-lg transition-all duration-300 md:hidden text-sm"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: showFilters || window.innerWidth >= 768 ? 'auto' : 0 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl md:p-6 mb-8 md:shadow-xl md:border border-gray-200 dark:border-gray-700 overflow-hidden ${showFilters ? 'p-6 shadow-xl border block' : 'md:block hidden'}`}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2 lg:col-span-4 mb-2">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search services or departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#00C2A8]/20 focus:border-[#00C2A8] transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                 {/* Dropdowns */}
                 <select
                  value={selectedDepartment || ''}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value ? Number(e.target.value) : null);
                    setSelectedService(null);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>

                <select
                  value={selectedService || ''}
                  onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">All Services</option>
                  {filteredServices.map(service => (
                    <option key={service.id} value={service.id}>{service.title}</option>
                  ))}
                </select>

                <select
                  value={selectedTier || ''}
                  onChange={(e) => setSelectedTier(e.target.value as any || null)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">All Tiers</option>
                  <option value="basic">Basic</option>
                  <option value="medium">Medium</option>
                  <option value="premium">Premium</option>
                </select>

                <div className="flex items-center gap-2">
                     <span className="text-sm text-gray-500 whitespace-nowrap">Max:</span>
                     <input
                        type="number"
                        placeholder="Price"
                        value={priceRange.max === 1000000 ? '' : priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value ? Number(e.target.value) : 1000000 })}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                     />
                </div>
             </div>
             
             <div className="flex justify-end mt-4">
                 <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white underline">
                     Reset Filters
                 </button>
             </div>
          </motion.div>


          {/* Services List */}
          <div className="space-y-12">
            {filteredServices.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-block p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Services Found</h3>
                    <p className="text-gray-500">Try adjusting your filters.</p>
                </div>
            ) : (
                filteredServices.map((service, index) => {
                    const serviceCards = getServiceCards(service.id);
                    
                    return (
                        <MovingBorderContainer
                            key={service.id}
                            borderRadius="1.5rem"
                            containerClassName="w-full h-auto"
                            className="bg-white dark:bg-gray-800 border-neutral-200 dark:border-gray-700 p-0 overflow-hidden items-start justify-start flex-col w-full"
                            duration={Math.floor(Math.random() * 5000) + 5000}
                            as="div"
                        >
                            <div className="w-full p-6 md:p-8 lg:p-10">
                                {renderServiceContent(service)}

                                {/* Pricing Cards Grid/Scroll */}
                                {serviceCards.length > 0 ? (
                                    <div className="relative">
                                         {/* Mobile Hint - Visible only on mobile if content overflows */}
                                         <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-full bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none" />
                                         
                                         <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
                                            {serviceCards.map((card) => {
                                                const isPopular = card.title === 'medium';
                                                return (
                                                    <div 
                                                        key={card.id} 
                                                        className="min-w-[280px] w-[85vw] max-w-[340px] md:w-auto md:max-w-none md:min-w-0 snap-center flex-shrink-0 md:flex-shrink"
                                                    >
                                                        <div className={`h-full relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl group
                                                            ${card.title === 'basic' ? 'border-blue-100 dark:border-blue-900/30 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/10 dark:to-gray-800' : 
                                                              card.title === 'medium' ? 'border-[#00C2A8]/30 bg-gradient-to-b from-[#00C2A8]/5 to-white dark:from-[#00C2A8]/10 dark:to-gray-800 scale-100 md:scale-105 shadow-lg z-10 ring-1 ring-[#00C2A8]/20' : 
                                                              'border-purple-100 dark:border-purple-900/30 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-800'}
                                                        `}>
                                                            {isPopular && (
                                                                <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#00C2A8] to-[#0066FF] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-20">
                                                                    POPULAR
                                                                </div>
                                                            )}
                                                            
                                                            {/* Discount Badge */}
                                                            {service.discount_percentage && service.discount_percentage > 0 && (
                                                                <div className="absolute top-0 left-0 bg-gradient-to-br from-red-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-sm z-20">
                                                                    {service.discount_percentage}% OFF
                                                                </div>
                                                            )}
                                                            
                                                            <div className="p-5 md:p-6 flex flex-col h-full">
                                                                <div className="mb-4">
                                                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3
                                                                         ${card.title === 'basic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                           card.title === 'medium' ? 'bg-[#00C2A8]/10 text-[#00C2A8] dark:text-[#00C2A8]' :
                                                                           'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}
                                                                    `}>
                                                                        {card.title}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-baseline gap-2">
                                                                            <span className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                                                                            ₹{(card.discounted_price && parseFloat(card.discounted_price.toString()) < parseFloat(card.price) ? parseFloat(card.discounted_price.toString()) : parseFloat(card.price)).toLocaleString('en-IN')}
                                                                            </span>
                                                                            {card.discounted_price && parseFloat(card.discounted_price.toString()) < parseFloat(card.price) && (
                                                                                <span className="text-sm text-gray-500 line-through">
                                                                                    ₹{parseFloat(card.price).toLocaleString('en-IN')}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {card.discounted_price && parseFloat(card.discounted_price.toString()) < parseFloat(card.price) && (
                                                                            <span className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                                                                                On Sale
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 mt-2 whitespace-normal break-words">
                                                                        {card.description}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 dark:border-gray-700/50 mb-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="w-3.5 h-3.5 text-[#00C2A8]" />
                                                                        <span>{card.delivery_days} Days</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <RefreshCw className="w-3.5 h-3.5 text-[#0066FF]" />
                                                                        <span>{card.revisions} Rev.</span>
                                                                    </div>
                                                                </div>

                                                                <ul className="space-y-3 mb-6 flex-1">
                                                                    {card.features?.slice(0, 5).map((feature, i) => (
                                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                            <span className="line-clamp-1">{feature}</span>
                                                                        </li>
                                                                    ))}
                                                                    {(card.features?.length || 0) > 5 && (
                                                                        <li className="flex items-center gap-2 text-xs text-gray-400 pl-6">
                                                                            <span>+{ (card.features?.length || 0) - 5 } more</span>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedCardForFeatures(card);
                                                                                }}
                                                                                className="hidden md:inline-flex items-center gap-1 text-[#00C2A8] hover:text-[#0066FF] transition-colors"
                                                                                aria-label="View all features"
                                                                            >
                                                                                <Eye className="w-3.5 h-3.5" />
                                                                                <span className="text-xs font-medium">View All</span>
                                                                            </button>
                                                                        </li>
                                                                    )}
                                                                </ul>

                                                                <button
                                                                    onClick={() => openFormWithPriceCard(card)}
                                                                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group
                                                                        ${card.title === 'medium' 
                                                                            ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white hover:shadow-lg hover:shadow-[#00C2A8]/25' 
                                                                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'}
                                                                    `}
                                                                >
                                                                    Choose Plan
                                                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                         </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-500 dark:text-gray-400 italic">
                                            No pricing plans tailored for your current filters are displayed here. 
                                            <button onClick={resetFilters} className="text-[#00C2A8] hover:underline ml-1">Clear filters</button> to see all plans.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </MovingBorderContainer>
                    );
                })
            )}
          </div>

        </div>
        </div>
      )}

       {/* Mobile Service Detail Modal */}
       <Dialog open={!!detailService} onOpenChange={handleCloseDetailModal}>
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden p-0 border-0 bg-white dark:bg-gray-900 rounded-2xl">
                 {detailService && (
                     <div className="h-full flex flex-col max-h-[90vh]">
                         <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
                              <h3 className="text-lg font-bold truncate pr-4">Service Details</h3>
                              <button onClick={handleCloseDetailModal} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                  <X className="w-5 h-5" />
                              </button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                             {renderServiceContent(detailService, true)}
                             
                             <div className="mt-8">
                                <h4 className="font-bold text-lg mb-4">Pricing Plans</h4>
                                <div className="space-y-6">
                                     {getServiceCards(detailService.id).map(card => {
                                         const isPopular = card.title === 'medium';
                                         return (
                                            <div key={card.id} className={`rounded-xl border p-4 ${card.title === 'basic' ? 'border-blue-100 bg-blue-50/20' : card.title === 'medium' ? 'border-[#00C2A8]/30 bg-[#00C2A8]/5' : 'border-purple-100 bg-purple-50/20'}`}>
                                                 <div className="flex justify-between items-start mb-2">
                                                     <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${card.title === 'basic' ? 'bg-blue-100 text-blue-700' : card.title === 'medium' ? 'bg-[#00C2A8]/20 text-[#00C2A8]' : 'bg-purple-100 text-purple-700'}`}>
                                                         {card.title}
                                                     </span>
                                                     {isPopular && <span className="text-[10px] font-bold text-[#00C2A8]">MOST POPULAR</span>}
                                                 </div>
                                                 <div className="mb-2">
                                                     <div className="text-2xl font-bold">
                                                        ₹{(card.discounted_price && parseFloat(card.discounted_price.toString()) < parseFloat(card.price) ? parseFloat(card.discounted_price.toString()) : parseFloat(card.price)).toLocaleString('en-IN')}
                                                     </div>
                                                     {card.discounted_price && parseFloat(card.discounted_price.toString()) < parseFloat(card.price) && (
                                                        <div className="text-sm text-gray-500 line-through">
                                                            ₹{parseFloat(card.price).toLocaleString('en-IN')}
                                                        </div>
                                                     )}
                                                 </div>
                                                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 whitespace-normal break-words">{card.description}</p>
                                                 
                                                 <div className="flex gap-4 text-xs text-gray-500 mb-4">
                                                     <span>{card.delivery_days} Days Delivery</span>
                                                     <span>{card.revisions} Revisions</span>
                                                 </div>
                                                 
                                                 <div className="space-y-2 mb-4">
                                                     {card.features?.map((f, i) => (
                                                         <div key={i} className="flex gap-2 text-sm">
                                                             <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                             <span>{f}</span>
                                                         </div>
                                                     ))}
                                                 </div>
                                                 
                                                 <button
                                                    onClick={() => {
                                                        handleCloseDetailModal();
                                                        openFormWithPriceCard(card);
                                                    }}
                                                    className="w-full py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium text-sm"
                                                 >
                                                     Choose Plan
                                                 </button>
                                            </div>
                                         )
                                     })}
                                </div>
                             </div>
                         </div>
                     </div>
                 )}
            </DialogContent>
       </Dialog>

      {/* Features Modal - Desktop Only */}
      <Dialog open={!!selectedCardForFeatures} onOpenChange={() => setSelectedCardForFeatures(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0 border-0 bg-white dark:bg-gray-900 rounded-2xl">
          {selectedCardForFeatures && (() => {
            const service = services.find(s => s.id === selectedCardForFeatures.service);
            return (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {service?.title}
                      </DialogTitle>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          selectedCardForFeatures.title === 'basic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          selectedCardForFeatures.title === 'medium' ? 'bg-[#00C2A8]/10 text-[#00C2A8]' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {selectedCardForFeatures.title}
                        </span>
                        <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                          ₹{(selectedCardForFeatures.discounted_price && parseFloat(selectedCardForFeatures.discounted_price.toString()) < parseFloat(selectedCardForFeatures.price) ? parseFloat(selectedCardForFeatures.discounted_price.toString()) : parseFloat(selectedCardForFeatures.price)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCardForFeatures(null)}
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00C2A8]" />
                    All Features Included
                  </h3>
                  <ul className="space-y-3">
                    {selectedCardForFeatures.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400 stroke-[3]" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 border border-[#00C2A8]/20">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00C2A8]" />
                        <span className="text-gray-700 dark:text-gray-300">{selectedCardForFeatures.delivery_days} Days Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#0066FF]" />
                        <span className="text-gray-700 dark:text-gray-300">{selectedCardForFeatures.revisions} Revisions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <button
                    onClick={() => {
                      setSelectedCardForFeatures(null);
                      openFormWithPriceCard(selectedCardForFeatures);
                    }}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group ${
                      selectedCardForFeatures.title === 'medium' 
                        ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white hover:shadow-lg hover:shadow-[#00C2A8]/25' 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                    }`}
                  >
                    Choose This Plan
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Service Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent">
          {modalService && selectedPriceCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl rounded-3xl shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00C2A8] via-[#0066FF] to-[#00C2A8]" />
             
              <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
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
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 border border-[#00C2A8]/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Selected Plan</h3>
                        <p className="text-[#0066FF] dark:text-[#00C2A8] text-sm mt-1 capitalize">
                          {selectedPriceCard.title} • ₹{(selectedPriceCard.discounted_price && parseFloat(selectedPriceCard.discounted_price.toString()) < parseFloat(selectedPriceCard.price) ? parseFloat(selectedPriceCard.discounted_price.toString()) : parseFloat(selectedPriceCard.price)).toLocaleString('en-IN')}
                          {selectedPriceCard.discounted_price && parseFloat(selectedPriceCard.discounted_price.toString()) < parseFloat(selectedPriceCard.price) && (
                              <span className="ml-2 text-xs text-gray-500 line-through">
                                  Original: ₹{parseFloat(selectedPriceCard.price).toLocaleString('en-IN')}
                              </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium text-sm"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Change
                      </button>
                    </div>
                  </motion.div>

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
