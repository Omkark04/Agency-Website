import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, Home, LayoutDashboard, Search, X, Filter,
  ChevronRight, ArrowLeft, Sparkles, Clock, RefreshCw, Star,
  Globe, Smartphone, Palette, Code, BarChart, LineChart, Eye, MessageCircle
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
import { SectionHeader } from '../components/shared/SectionHeader';
import { useAuth } from '../hooks/useAuth';
import IntroAnimation from '../components/animations/IntroAnimation';
import { useIntro } from '../context/IntroContext';

function PricingCarousel({ serviceCards, service, openFormWithPriceCard, setSelectedCardForFeatures }: { serviceCards: PriceCard[], service: Service, openFormWithPriceCard: (card: PriceCard) => void, setSelectedCardForFeatures: (card: PriceCard) => void }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
        setActiveIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.innerWidth >= 768) return; 
            if (!scrollRef.current) return;
            const nextIndex = (activeIndex + 1) % serviceCards.length;
            const targetLeft = nextIndex * scrollRef.current.clientWidth;
            scrollRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
        }, 5000); 
        return () => clearInterval(interval);
    }, [activeIndex, serviceCards.length]);

    return (
        <div className="relative">
            <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
            
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 scroll-smooth"
            >
                {serviceCards.map((card) => {
                    const isPopular = card.title === 'medium';
                    return (
                        <div 
                            key={card.id} 
                            className="min-w-[280px] w-[85vw] max-w-[340px] md:w-auto md:max-w-none md:min-w-0 snap-center flex-shrink-0 md:flex-shrink"
                        >
                            <div className={`h-full relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl group
                                ${card.title === 'basic' ? 'border-blue-100 bg-gradient-to-b from-blue-50/50 to-white' : 
                                  card.title === 'medium' ? 'border-[#015bad]/30 bg-gradient-to-b from-[#015bad]/5 to-white scale-100 md:scale-105 shadow-lg z-10 ring-1 ring-[#015bad]/20' : 
                                  'border-purple-100 bg-gradient-to-b from-purple-50/50 to-white'}
                            `}>
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#015bad] to-[#0A1F44] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-20">
                                        POPULAR
                                    </div>
                                )}
                                
                                <div className="p-5 md:p-6 flex flex-col h-full">
                                    <div className="mb-4">
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3
                                             ${card.title === 'basic' ? 'bg-blue-100 text-blue-700' :
                                               card.title === 'medium' ? 'bg-[#015bad]/10 text-[#F5B041]' :
                                               'bg-purple-100 text-purple-700'}
                                        `}>
                                            {card.title}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 whitespace-normal break-words">
                                            {card.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 mb-4 text-xs md:text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#F5B041]" />
                                            <span>{card.delivery_days} Days</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5 text-[#0A1F44]" />
                                            <span>{card.revisions} Rev.</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-6 flex-1">
                                        {card.features?.slice(0, 5).map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-1">{feature}</span>
                                            </li>
                                        ))}
                                        {(card.features?.length || 0) > 5 && (
                                            <li className="flex items-center justify-between text-xs pl-6">
                                                <span className="text-gray-400">+{ (card.features?.length || 0) - 5 } more</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCardForFeatures(card);
                                                    }}
                                                    className="hidden md:inline-flex items-center gap-1 text-[#F5B041] hover:text-[#0A1F44] transition-colors font-medium"
                                                    aria-label="View all features"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View All</span>
                                                </button>
                                            </li>
                                        )}
                                    </ul>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openFormWithPriceCard(card)}
                                            className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1 group
                                                ${card.title === 'medium' 
                                                    ? 'bg-gradient-to-r from-[#015bad] to-[#0A1F44] text-white hover:shadow-lg hover:shadow-[#015bad]/25' 
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'}
                                            `}
                                        >
                                            Choose Plan <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Dots Indicator — visible on all screens, clickable */}
            <div className="flex justify-center items-center gap-2 mt-4 pb-2">
                {serviceCards.map((card, idx) => (
                    <button
                        key={idx}
                        title={`${card.title} plan`}
                        onClick={() => {
                            if (!scrollRef.current) return;
                            scrollRef.current.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: 'smooth' });
                            setActiveIndex(idx);
                        }}
                        className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                            idx === activeIndex ? 'w-6 bg-[#015bad]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function PricingPlansPage() {
  const [cards, setCards] = useState<PriceCard[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'medium' | 'premium' | null>(null);


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

  const handleIntroComplete = () => {
    // No longer used but kept for context if needed, or can be removed
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
      // Silently fail
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
        if (selectedTier && card.title !== selectedTier) return false;
        return true;
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment(null);
    setSelectedService(null);
    setSelectedTier(null);
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
                        className="md:hidden absolute top-0 right-0 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors z-10"
                        aria-label="View Service Details"
                     >
                         <Eye className="w-5 h-5" />
                     </button>
                )}

                <div className="flex flex-row md:flex-col gap-4 md:gap-0 items-center md:items-start">
                    <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#015bad]/10 to-[#0A1F44]/10 flex items-center justify-center">
                            <CategoryIcon className="w-6 h-6 md:w-8 md:h-8 text-[#0A1F44]" />
                        </div>
                    </div>
                    {/* Mobile: Title next to logo. Desktop: Title separate via flex-cols swap or implicit flow */}
                     <div className="md:hidden flex-1 pr-10"> {/* pr-10 to avoid overlap with absolute eye button */}
                        <h2 className="font-bold text-gray-900 text-lg leading-tight mb-1 break-words">
                            {service.title}
                        </h2>
                         <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600 whitespace-nowrap">
                            {service.department_title}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {/* Desktop Title Area - Hidden on Mobile since we show it next to logo above */}
                    <div className="hidden md:flex items-center justify-between gap-3 mb-2 flex-wrap">
                         <div className="flex items-center gap-3 flex-wrap">
                            <h2 className={`font-bold text-gray-900 break-words ${isModal ? 'text-2xl' : 'text-3xl'}`}>
                                {service.title}
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 whitespace-nowrap">
                                {service.department_title}
                            </span>
                         </div>
                    </div>

                    <p className="text-sm md:text-base text-gray-600 mb-3 font-medium whitespace-normal break-words mt-2 md:mt-0">
                        {service.short_description}
                    </p>
                    
                    <div className={`prose prose-sm dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 whitespace-normal break-words ${isModal ? 'block' : 'hidden md:block'}`}>
                        <p>{service.long_description}</p>
                    </div>

                    <div className="mt-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const message = `Hi, I am interested in exploring the *${service.title}* services.`;
                          window.open(`https://wa.me/919604177408?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="py-2 px-5 w-full sm:w-auto rounded-xl text-sm font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white hover:shadow-lg hover:shadow-[#25D366]/20 bg-white"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Enquire Now
                      </button>
                    </div>
                </div>
            </div>
          </>
      );
  };


  return (
    <>
      <SEOHead 
        title="Pricing Plans"
        description="Choose the perfect plan for your business needs. Transparent pricing for web development, design, and digital marketing services."
        url="/pricing-plans"
      />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-white">
             <div className="flex flex-col items-center gap-4">
                 <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-t-[#015bad] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 </div>
                 <p className="text-gray-500 font-medium animate-pulse">Loading Plans...</p>
             </div>
         </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        
        {/* New Hero Section */}
        <div className="relative w-full border-b border-gray-200 mb-8 md:mb-12 overflow-hidden aspect-square md:aspect-auto md:h-[50vh]">
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
                            <div key="desktop-gradient" className="w-full h-full bg-gradient-to-r from-[#015bad]/10 via-[#0A1F44]/10 to-purple-500/10" />
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
                            <div key="mobile-gradient" className="w-full h-full bg-gradient-to-r from-[#015bad]/10 via-[#0A1F44]/10 to-purple-500/10" />
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40 pb-16 md:pb-20 text-center">
                 <div className="mb-0">
                    <SectionHeader
                      caption={selectedDepartment 
                        ? departments.find(d => d.id === selectedDepartment)?.name || 'Service Category'
                        : 'Complete Catalog'}
                      title={selectedDepartment 
                        ? `${departments.find(d => d.id === selectedDepartment)?.name}`
                        : 'ALL PRICING'}
                      highlightedTitle={selectedDepartment ? "PLANS" : "PLANS"}
                      description="Choose the perfect plan for your business needs. Transparent pricing for web development, design, and digital marketing services."
                      className="mb-6"
                    />
                 </div>
                    {selectedDepartment && (
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-all shadow-sm"
                      >
                        <X className="w-4 h-4" />
                        Clear Filter
                      </button>
                    )}
            </div>
        </div>


        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl pb-20">
          
          {/* Header Controls */}
           <div className="flex flex-wrap items-center justify-end mb-8 gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:shadow-lg transition-all duration-300 md:hidden text-sm"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: showFilters || window.innerWidth >= 768 ? 'auto' : 0 }}
            className={`bg-white rounded-2xl md:p-6 mb-8 md:shadow-xl md:border border-gray-200 overflow-hidden ${showFilters ? 'p-6 shadow-xl border block' : 'md:block hidden'}`}
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
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#015bad]/20 focus:border-[#015bad] transition-all"
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
                  value={selectedService || ''}
                  onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm"
                >
                  <option value="">All Services</option>
                  {filteredServices.map(service => (
                    <option key={service.id} value={service.id}>{service.title}</option>
                  ))}
                </select>

                <select
                  value={selectedTier || ''}
                  onChange={(e) => setSelectedTier(e.target.value as any || null)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm"
                >
                  <option value="">All Tiers</option>
                  <option value="basic">Basic</option>
                  <option value="medium">Medium</option>
                  <option value="premium">Premium</option>
                </select>

              </div>
             
             <div className="flex justify-end mt-4">
                  <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-gray-900 underline bg-transparent hover:bg-transparent">
                      Reset Filters
                  </button>
             </div>
          </motion.div>


          {/* Services List */}
          <div className="space-y-12">
            {filteredServices.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700">No Services Found</h3>
                    <p className="text-gray-500">Try adjusting your filters.</p>
                </div>
            ) : (
                filteredServices.map((service, index) => {
                    const serviceCards = getServiceCards(service.id);
                    
                    return (
                        <MovingBorderContainer
                            key={service.id}
                            borderRadius="1.5rem"
                            containerClassName="w-full h-auto scroll-mt-32 relative"
                            className="bg-white border-neutral-200 p-0 md:overflow-hidden items-start justify-start flex-col w-full"
                            duration={Math.floor(Math.random() * 5000) + 5000}
                            id={`service-${service.id}`}
                            as="div"
                        >
                            <div className="w-full">
                                {/* Service Header Info — always padded */}
                                <div className="px-4 pt-5 pb-0 md:px-8 md:pt-8 lg:px-10 lg:pt-10">
                                    {renderServiceContent(service)}
                                </div>

                                {/* Pricing Cards Grid/Scroll — full-width on mobile */}
                                {serviceCards.length > 0 && (
                                    <div className="w-full px-4 pb-5 md:px-8 md:pb-8 lg:px-10 lg:pb-10">
                                        <PricingCarousel 
                                            serviceCards={serviceCards} 
                                            service={service} 
                                            openFormWithPriceCard={openFormWithPriceCard} 
                                            setSelectedCardForFeatures={setSelectedCardForFeatures} 
                                        />
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
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden p-0 border-0 bg-white rounded-2xl">
                 {detailService && (
                     <div className="h-full flex flex-col max-h-[90vh]">
                         <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                              <h3 className="text-lg font-bold truncate pr-4">Service Details</h3>
                              <button onClick={handleCloseDetailModal} className="p-2 bg-gray-100 rounded-full">
                                  <X className="w-5 h-5" />
                              </button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                             {renderServiceContent(detailService, true)}
                             
                             {getServiceCards(detailService.id).length > 0 && (
                               <div className="mt-8">
                                  <h4 className="font-bold text-lg mb-4">Pricing Plans</h4>
                                  <div className="space-y-6">
                                       {getServiceCards(detailService.id).map(card => {
                                           const isPopular = card.title === 'medium';
                                           return (
                                              <div key={card.id} className={`rounded-xl border p-4 ${card.title === 'basic' ? 'border-blue-100 bg-blue-50/20' : card.title === 'medium' ? 'border-[#015bad]/30 bg-[#015bad]/5' : 'border-purple-100 bg-purple-50/20'}`}>
                                                   <div className="flex justify-between items-start mb-2">
                                                       <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${card.title === 'basic' ? 'bg-blue-100 text-blue-700' : card.title === 'medium' ? 'bg-[#015bad]/20 text-[#F5B041]' : 'bg-purple-100 text-purple-700'}`}>
                                                           {card.title}
                                                       </span>
                                                       {isPopular && <span className="text-[10px] font-bold text-[#F5B041]">MOST POPULAR</span>}
                                                   </div>
                                                   <p className="text-sm text-gray-600 mb-4 whitespace-normal break-words">{card.description}</p>
                                                   
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
                                                      className="w-full py-2 rounded-lg bg-gray-900 text-white font-medium text-sm"
                                                   >
                                                       Choose Plan
                                                   </button>
                                              </div>
                                           )
                                       })}
                                  </div>
                               </div>
                             )}
                         </div>
                     </div>
                 )}
            </DialogContent>
       </Dialog>

      {/* Features Modal - Desktop Only */}
      <Dialog open={!!selectedCardForFeatures} onOpenChange={() => setSelectedCardForFeatures(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 border-0 bg-white rounded-2xl">
          {selectedCardForFeatures && (() => {
            const service = services.find(s => s.id === selectedCardForFeatures.service);
            return (
              <div className="h-full flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {service?.title}
                      </DialogTitle>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          selectedCardForFeatures.title === 'basic' ? 'bg-blue-100 text-blue-700' :
                          selectedCardForFeatures.title === 'medium' ? 'bg-[#015bad]/10 text-[#F5B041]' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {selectedCardForFeatures.title}
                        </span>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F5B041]" />
                    All Features Included
                  </h3>
                  <ul className="space-y-3">
                    {selectedCardForFeatures.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600 stroke-[3]" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 flex-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#015bad]/10 to-[#0A1F44]/10 border border-[#015bad]/20">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#F5B041]" />
                        <span className="text-gray-700">{selectedCardForFeatures.delivery_days} Days Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#0A1F44]" />
                        <span className="text-gray-700">{selectedCardForFeatures.revisions} Revisions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => {
                      setSelectedCardForFeatures(null);
                      openFormWithPriceCard(selectedCardForFeatures);
                    }}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group ${
                      selectedCardForFeatures.title === 'medium' 
                        ? 'bg-gradient-to-r from-[#015bad] to-[#0A1F44] text-white hover:shadow-lg hover:shadow-[#015bad]/25' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
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
              className="relative bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl rounded-3xl shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#015bad] via-[#0A1F44] to-[#015bad]" />
             
              <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {modalService.title}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 mt-2">
                        Complete your service request
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-[#015bad]/10 to-[#0A1F44]/10 border border-[#015bad]/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">Selected Plan</h3>
                        <p className="text-[#0A1F44] text-sm mt-1 capitalize">
                          {selectedPriceCard.title}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="flex items-center text-gray-500 hover:text-gray-900 font-medium text-sm"
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
