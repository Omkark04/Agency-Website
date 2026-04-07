import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Home, ArrowLeft, Sparkles, Clock, Star, Filter, X, ChevronRight, Eye, RefreshCw, Search
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listPriceCards, type PriceCard } from '../api/pricecards';
import { listServices, type Service } from '../api/services';
import { listDepartments, type Department } from '../api/departments';
import { fetchPortfolioProjects, type PortfolioProject } from '../api/portfolio';
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
import { Header } from './landing/components/Header';
import { Footer } from './landing/components/Footer';
import AuthModal from './landing/components/AuthModal';

function PricingCarousel({ activeCards, service, onSelectPlan, onShowFeatures }: { activeCards: PriceCard[], service: Service, onSelectPlan: (card: PriceCard) => void, onShowFeatures: (card: PriceCard) => void }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        // Calculate the nearest snapping point index
        const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
        setActiveIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.innerWidth >= 768) return; // Only auto-scroll on mobile
            if (!scrollRef.current) return;
            const nextIndex = (activeIndex + 1) % activeCards.length;
            const targetLeft = nextIndex * scrollRef.current.clientWidth;
            scrollRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
        }, 5000); // 5 seconds interval
        return () => clearInterval(interval);
    }, [activeIndex, activeCards.length]);

    return (
        <div className="relative mt-8">
            <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-full bg-gradient-to-l from-white dark:from-[#1F2933] to-transparent pointer-events-none" />
            
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 md:mx-0 px-6 md:px-0 scroll-smooth"
            >
                {activeCards.map((card, index) => {
                    const isPopular = card.title === 'medium';
                    return (
                        <div 
                            key={card.id}
                            className="min-w-[280px] w-[85vw] max-w-[350px] md:w-auto md:max-w-none md:min-w-0 snap-center flex-shrink-0 md:flex-shrink"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                className={`relative flex flex-col h-full bg-white dark:bg-[#1F2933] rounded-[2rem] border transition-all duration-500
                                    ${isPopular 
                                        ? 'border-[#015bad]/30 bg-gradient-to-b from-[#015bad]/5 to-white dark:from-[#015bad]/10 dark:to-[#1F2933] scale-100 md:scale-105 shadow-xl z-20 ring-1 ring-[#015bad]/20' 
                                        : 'border-gray-200 dark:border-gray-800 hover:border-[#015bad]/30 hover:shadow-lg dark:hover:border-gray-700'}
                                `}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#015bad] to-[#0A1F44] text-white text-[10px] font-bold px-4 py-2 rounded-bl-2xl rounded-tr-[2rem] shadow-sm z-20 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Star className="w-3 h-3 fill-current" /> Most Popular
                                    </div>
                                )}

                                <div className="p-8 md:p-10 flex flex-col h-full">
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${card.title === 'basic' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : 
                                                    isPopular ? 'bg-[#F5B041] text-[#0A1F44]' : 
                                                    'bg-[#0A1F44] text-white'}`}
                                            >
                                                {card.title} Plan
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-grow">
                                        {card.features?.slice(0, 5).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3 group">
                                                <div className={`mt-0.5 shrink-0 rounded-full p-1 
                                                    ${isPopular ? 'bg-[#F5B041]/20 text-[#0A1F44] dark:bg-[#F5B041]/20 dark:text-[#F5B041]' : 
                                                    'bg-[#015bad]/10 text-[#015bad] dark:bg-gray-800 dark:text-gray-400'}`}
                                                >
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors leading-relaxed">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                        
                                        {card.features && card.features.length > 5 && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onShowFeatures(card); }}
                                                className="text-[#015bad] dark:text-[#F5B041] text-sm font-medium hover:underline flex items-center gap-1 mt-4"
                                            >
                                                + {card.features.length - 5} more features <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const message = `Hi, I am interested in the *${card.title}* plan for *${service.title}* services.`;
                                                    window.open(`https://wa.me/918010957676?text=${encodeURIComponent(message)}`, '_blank');
                                                }}
                                                className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white hover:shadow-lg hover:shadow-[#25D366]/20 bg-transparent`}
                                            >
                                                Enquire Now
                                            </button>
                                            <button
                                                onClick={() => onSelectPlan(card)}
                                                className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 group
                                                    ${isPopular 
                                                        ? 'bg-gradient-to-r from-[#015bad] to-[#0A1F44] text-white hover:shadow-lg hover:shadow-[#015bad]/25' 
                                                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'}
                                                `}
                                            >
                                                Get Started <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
            {/* Dots Indicator */}
            <div className="md:hidden flex justify-center items-center gap-2 mt-4 pb-2">
                {activeCards.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`transition-all duration-300 rounded-full h-2 ${
                            idx === activeIndex ? 'w-6 bg-[#015bad]' : 'w-2 bg-gray-300 dark:bg-gray-600'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function DepartmentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { navigateTo } = useProtectedNavigation();
  const { user } = useAuth();

  const [department, setDepartment] = useState<Department | null>(null);
  const [otherDepartments, setOtherDepartments] = useState<Department[]>([]);
  
  const [cards, setCards] = useState<PriceCard[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'medium' | 'premium' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPriceCard, setSelectedPriceCard] = useState<PriceCard | null>(null);
  const [modalService, setModalService] = useState<Service | null>(null);
  const [detailService, setDetailService] = useState<Service | null>(null);
  const [selectedCardForFeatures, setSelectedCardForFeatures] = useState<PriceCard | null>(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all departments to find the current one by slug and get the others
      const deptRes = await listDepartments({ is_active: true });
      const currentDept = deptRes.data.find(d => d.slug === slug);
      
      if (!currentDept) {
        navigate('/pricing-plans');
        return;
      }

      setDepartment(currentDept);
      setOtherDepartments(deptRes.data.filter(d => d.id !== currentDept.id));

      // Fetch cards and services
      const [cardsRes, servicesRes, portRes] = await Promise.all([
        listPriceCards(),
        listServices({ department: currentDept.id, is_active: true }),
        fetchPortfolioProjects({ service__department: currentDept.id, limit: 6 })
      ]);
      
      setCards(cardsRes.data);
      setServices(servicesRes.data);
      setPortfolio(portRes);

      // Reset selected service on department change
      setSelectedService(null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => {
      if (selectedService && s.id !== selectedService) return false;
      if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && !s.short_description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
  });

  const getServiceCards = (serviceId: number) => {
    return cards.filter(card => {
        if (card.service !== serviceId) return false;
        if (selectedTier && card.title.toLowerCase() !== selectedTier) return false;
        return true;
    }).sort((a, b) => {
        const order = { basic: 1, medium: 2, premium: 3 };
        return (order[a.title.toLowerCase() as keyof typeof order] || 4) - 
               (order[b.title.toLowerCase() as keyof typeof order] || 4);
    });
  };

  const handleSelectPlan = (card: PriceCard) => {
    const srv = services.find(s => s.id === card.service);
    if (!srv) return;
    
    if (!user) {
      navigate('/auth/login', { 
        state: { 
          returnTo: window.location.pathname + window.location.search,
          message: 'Please login to continue with your selection.'
        } 
      });
      return;
    }
    
    setSelectedPriceCard(card);
    setModalService(srv);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 md:w-12 md:h-12 text-[#015bad] animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading {slug?.replace(/-/g, ' ')}...</p>
        </div>
      </div>
    );
  }

  if (!department) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <SEOHead 
        title={`${department.title} Services | OneKraft`}
        description={department.short_description || `Explore our professional ${department.title} services, pricing plans, and portfolio.`}
      />

      <Header onAuthButtonClick={() => setIsAuthModalOpen(true)} />

      {/* BIG HERO SECTION matching homepage style */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-[#0A1F44] flex-1 mt-14 md:mt-20">
        {department.logo ? (
          <div className="absolute inset-0 opacity-20">
            <img src={department.logo} alt={department.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#015bad]/20 to-[#0A1F44] opacity-50" />
        )}
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-[#F5B041] mb-4 border border-[#F5B041]/30"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wider uppercase">Department</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              {department.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              {department.short_description || `Discover our customized ${department.title.toLowerCase()} services designed to scale your business.`}
            </motion.p>
          </div>
        </div>
      </section>

      {/* DEPARTMENT NAVIGATOR */}
      <div className="bg-white dark:bg-[#1F2933] border-b border-gray-200 dark:border-gray-800 sticky top-16 md:top-[72px] z-40 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 md:gap-4 hide-scrollbar">
          <span className="text-sm font-medium text-gray-500 shrink-0 mr-2">Other Departments:</span>
          {otherDepartments.map(d => (
            <Link 
              key={d.id} 
              to={`/departments/${d.slug}`}
              className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#015bad] hover:text-white transition-colors"
            >
              {d.title}
            </Link>
          ))}
          <Link 
            to="/pricing-plans"
            className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap text-[#015bad] hover:bg-[#015bad]/10 transition-colors ml-auto flex items-center gap-1"
          >
            View All Services <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        
        {/* PORTFOLIO SECTION */}
        {portfolio.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our {department.title} Success Stories</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Explore some of the incredible projects we've built in this domain.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {portfolio.map((project) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-[#1F2933] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-800"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={project.featured_image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 truncate">{project.title}</h3>
                      <p className="text-[#F5B041] text-sm font-medium">{project.client_name}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6">
                      {project.description}
                    </p>
                    <Link 
                      to={`/portfolio`}
                      className="inline-flex items-center gap-2 text-[#015bad] dark:text-[#F5B041] font-medium hover:underline"
                    >
                      View Full Portfolio <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES AND PRICING HEADER */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Services & Pricing Plans
          </h2>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#015bad] focus:border-transparent transition-all outline-none"
                />
            </div>

            {/* Tier Filters */}
            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full md:w-auto overflow-x-auto hide-scrollbar">
                <button
                    onClick={() => setSelectedTier(null)}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${
                        selectedTier === null
                            ? 'bg-[#015bad] text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    All
                </button>
                {(['basic', 'medium', 'premium'] as const).map((tier) => (
                    <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${
                            selectedTier === tier
                                ? 'bg-[#015bad] text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        {tier}
                    </button>
                ))}
            </div>
          </div>
        </div>

        {/* SERVICES LISTING EXACTLY LIKE PRICING PLANS */}
        {filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No services match your filters.</h3>
                <p className="text-gray-500 mb-6">Try adjusting your selections above.</p>
                <button onClick={() => { setSelectedService(null); setSelectedTier(null); setSearchQuery(''); }} className="text-[#015bad] hover:underline font-medium">Clear all filters</button>
            </div>
        ) : (
            <div className="space-y-12 md:space-y-24">
                {filteredServices.map(service => {
                    const activeCards = getServiceCards(service.id);
                    if (activeCards.length === 0) return null;

                    return (
                        <MovingBorderContainer
                            key={service.id}
                            borderRadius="1.5rem"
                            containerClassName="w-full h-auto scroll-mt-32 relative"
                            className="bg-white dark:bg-[#1F2933] border-neutral-200 dark:border-gray-800 p-0 overflow-hidden items-start justify-start flex-col w-full"
                            duration={Math.floor(Math.random() * 5000) + 5000}
                            id={`service-${service.id}`}
                            as="div"
                        >
                            <div className="w-full p-6 md:p-8 lg:p-10">
                                {/* Service Header Info */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="max-w-3xl">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F5B041]/20 text-[#0A1F44] dark:text-[#F5B041]">
                                                {department.title}
                                            </span>
                                            {activeCards.some(c => c.title === 'medium') && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#015bad]/10 text-[#015bad] dark:text-[#F5B041]">
                                                    <Star className="w-3.5 h-3.5 fill-current" /> Popular Category
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-[#015bad] transition-colors">{service.title}</h2>
                                          <button
                                              onClick={() => setDetailService(service)}
                                              className="p-2 rounded-full text-gray-400 hover:text-[#015bad] hover:bg-[#015bad]/10 transition-colors tooltip-trigger relative group"
                                              title="View Service Details"
                                          >
                                              <Eye className="w-5 h-5" />
                                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Service Details</span>
                                          </button>
                                        </div>

                                        {service.short_description && (
                                            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm md:text-base md:leading-relaxed">{service.short_description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Cards Grid */}
                                <PricingCarousel 
                                    activeCards={activeCards} 
                                    service={service} 
                                    onSelectPlan={handleSelectPlan} 
                                    onShowFeatures={setSelectedCardForFeatures} 
                                />
                            </div>
                        </MovingBorderContainer>
                    );
                })}
            </div>
        )}
      </div>

      {/* --- MOdals from PricingPlansPage --- */}

      {/* Features View Modal */}
      <Dialog open={!!selectedCardForFeatures} onOpenChange={(open) => !open && setSelectedCardForFeatures(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#015bad] to-[#0A1F44] p-6 text-white text-center rounded-t-lg relative">
            <h2 className="text-2xl font-bold uppercase tracking-wider">{selectedCardForFeatures?.title} Plan Features</h2>
            <button onClick={() => setSelectedCardForFeatures(null)} className="absolute right-4 top-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCardForFeatures?.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                           <div className={`mt-0.5 shrink-0 rounded-full p-1 bg-[#015bad]/10 text-[#015bad]`}>
                               <Check className="w-3.5 h-3.5" strokeWidth={3} />
                           </div>
                           <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </div>
                  ))}
             </div>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-right rounded-b-lg">
               <button 
                  onClick={() => {
                      if(selectedCardForFeatures) handleSelectPlan(selectedCardForFeatures);
                      setSelectedCardForFeatures(null);
                  }}
                  className="bg-[#F5B041] hover:bg-[#e6a030] text-[#0A1F44] font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
               >
                   Select This Plan
               </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Details Modal */}
      <Dialog open={!!detailService} onOpenChange={(open) => !open && setDetailService(null)}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 p-0 overflow-hidden border-none shadow-2xl">
          <div className="relative p-8 md:p-12 text-center bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#015bad] via-[#0A1F44] to-[#015bad]" />
              <button onClick={() => setDetailService(null)} className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-gray-700 rounded-full transition"><X className="w-5 h-5"/></button>
              <div className="inline-flex items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
                  <Star className="w-8 h-8 text-[#F5B041] fill-current" />
              </div>
              <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{detailService?.title}</DialogTitle>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">{detailService?.short_description}</p>
          </div>
          
          <div className="p-8 md:p-12 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {(detailService as any)?.requirements_description && (
                  <div className="mb-8 p-6 rounded-2xl bg-[#015bad]/5 dark:bg-[#015bad]/10 border border-[#015bad]/20">
                      <h4 className="text-sm font-bold text-[#015bad] dark:text-[#F5B041] uppercase tracking-wider mb-3">Service Requirements</h4>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{(detailService as any).requirements_description}</p>
                  </div>
              )}
              {(detailService as any)?.description ? (
                  <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Full Overview</h4>
                      <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                         {(detailService as any).description.split('\n').map((paragraph: string, i: number) => (
                             <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
                         ))}
                      </div>
                  </div>
              ) : detailService?.long_description ? (
                  <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Full Overview</h4>
                      <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                         {detailService.long_description.split('\n').map((paragraph: string, i: number) => (
                             <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
                         ))}
                      </div>
                  </div>
              ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-0">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 relative">
             <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-gray-700 rounded-full transition"><X className="w-5 h-5"/></button>
             <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Let's Get Started</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 text-base">
                Please provide details for the \b<span className="font-semibold text-gray-900 dark:text-white">{modalService?.title}</span> • <span className="font-semibold uppercase tracking-wider text-[#015bad] dark:text-[#F5B041]">{selectedPriceCard?.title} Plan</span>\b
                </DialogDescription>
             </DialogHeader>
          </div>
          <div className="p-6 md:p-8 bg-white dark:bg-gray-900">
            {modalService && selectedPriceCard && user?.id ? (
              <DynamicFormRenderer
                serviceId={modalService.id}
                priceCardId={selectedPriceCard.id}
                onSuccess={() => {
                  setIsModalOpen(false);
                  navigate('/client-dashboard/orders', { 
                    state: { message: '✓ Request submitted successfully! View your orders below.' }
                  });
                }}
              />
            ) : (
                <div className="text-center py-12">
                   <p className="text-red-500 mb-4">Error loading form. Missing required details.</p>
                   <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Close</button>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer and AuthModal */}
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
