import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Home, ArrowLeft, Sparkles, Clock, Star, Filter, X, ChevronRight, Eye, RefreshCw, Search,
  Globe, Smartphone, Palette, Code, BarChart, LineChart
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

// ─── FIX 1: PricingCarousel ───────────────────────────────────────────────────
function PricingCarousel({ serviceCards, service, openFormWithPriceCard, setSelectedCardForFeatures }: {
  serviceCards: PriceCard[];
  service: Service;
  openFormWithPriceCard: (card: PriceCard) => void;
  setSelectedCardForFeatures: (card: PriceCard) => void;
}) {
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
      const container = scrollRef.current;
      const nextIndex = (activeIndex + 1) % serviceCards.length;
      // Use the first child's actual offsetWidth so we land exactly on the next card
      const slideWidth = (container.firstElementChild as HTMLElement)?.offsetWidth ?? container.clientWidth;
      container.scrollTo({ left: nextIndex * slideWidth, behavior: 'smooth' });
      setActiveIndex(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, serviceCards.length]);

  return (
    // FIX: touch-pan-y lets vertical page scroll work even when touching the carousel
    <div className="w-full relative overflow-visible touch-pan-y md:touch-auto">
      {/* Right-edge fade hint — mobile only */}
      <div className="md:hidden absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none" />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6
                   overflow-x-auto md:overflow-visible
                   pb-10 md:pb-0
                   snap-x snap-mandatory
                   -mx-4 md:mx-0 px-4 md:px-0
                   scroll-smooth
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {serviceCards.map((card) => {
          const isPopular = card.title === 'medium';
          return (
            <div
              key={card.id}
              // FIX: min() ensures cards never overflow on screens narrower than 320px
              className="flex-shrink-0 snap-center w-[min(85vw,320px)] md:w-auto"
            >
              <div className={`h-full relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl group
                ${card.title === 'basic'
                  ? 'border-blue-100 dark:border-blue-900/30 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/10 dark:to-gray-800'
                  : card.title === 'medium'
                    ? 'border-[#015bad]/30 bg-gradient-to-b from-[#015bad]/5 to-white dark:from-[#015bad]/10 dark:to-gray-800 scale-[1.02] shadow-lg z-10 ring-1 ring-[#015bad]/20'
                    : 'border-purple-100 dark:border-purple-900/30 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-800'}
              `}>
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#015bad] to-[#0A1F44] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-20">
                    POPULAR
                  </div>
                )}

                <div className="p-5 md:p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3
                      ${card.title === 'basic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : card.title === 'medium' ? 'bg-[#015bad]/10 text-[#F5B041] dark:text-[#F5B041]'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}
                    `}>
                      {card.title}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                      {card.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 dark:border-gray-700/50 mb-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
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
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{feature}</span>
                      </li>
                    ))}
                    {(card.features?.length || 0) > 5 && (
                      <li className="flex items-center justify-between text-xs pl-6">
                        <span className="text-gray-400">+{(card.features?.length || 0) - 5} more</span>
                        {/* FIX: visible on mobile too (was hidden md:inline-flex) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedCardForFeatures(card); }}
                          className="inline-flex items-center gap-1 text-[#F5B041] hover:text-[#0A1F44] transition-colors font-medium bg-transparent hover:bg-transparent"
                          aria-label="View all features"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View All</span>
                        </button>
                      </li>
                    )}
                  </ul>

                  {/* FIX: buttons wrap to column on very narrow cards */}
                  <div className="flex flex-col xs:flex-row gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const message = `Hi, I am interested in the *${card.title}* plan for *${service.title}* services.`;
                        window.open(`https://wa.me/918010957676?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white hover:shadow-lg hover:shadow-[#25D366]/20 bg-white"
                    >
                      Enquire Now
                    </button>
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

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-2 z-20 md:hidden">
        {serviceCards.map((_, idx) => (
          <button
            key={idx}
            title={`Plan ${idx + 1}`}
            onClick={() => {
              if (!scrollRef.current) return;
              const container = scrollRef.current;
              const slideWidth = (container.firstElementChild as HTMLElement)?.offsetWidth ?? 300;
              container.scrollTo({ left: idx * slideWidth, behavior: 'smooth' });
              setActiveIndex(idx);
            }}
            className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${idx === activeIndex ? 'w-6 bg-[#015bad]' : 'w-2 bg-gray-400 dark:bg-gray-500 hover:bg-[#015bad]'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPriceCard, setSelectedPriceCard] = useState<PriceCard | null>(null);
  const [modalService, setModalService] = useState<Service | null>(null);
  const [detailService, setDetailService] = useState<Service | null>(null);
  const [selectedCardForFeatures, setSelectedCardForFeatures] = useState<PriceCard | null>(null);

  useEffect(() => { fetchData(); }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const deptRes = await listDepartments({ is_active: true });
      const currentDept = deptRes.data.find(d => d.slug === slug);
      if (!currentDept) { navigate('/pricing-plans'); return; }

      setDepartment(currentDept);
      setOtherDepartments(deptRes.data.filter(d => d.id !== currentDept.id));

      const [cardsRes, servicesRes, portRes] = await Promise.all([
        listPriceCards(),
        listServices({ department: currentDept.id, is_active: true }),
        fetchPortfolioProjects({ service__department: currentDept.id, limit: 6 }),
      ]);

      setCards(cardsRes.data);
      setServices(servicesRes.data);
      setPortfolio(portRes);
      setSelectedService(null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => {
    if (selectedService && s.id !== selectedService) return false;
    if (searchQuery &&
      !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.short_description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getServiceCards = (serviceId: number) =>
    cards
      .filter(card => {
        if (card.service !== serviceId) return false;
        if (selectedTier && card.title.toLowerCase() !== selectedTier) return false;
        return true;
      })
      .sort((a, b) => {
        const order = { basic: 1, medium: 2, premium: 3 };
        return (order[a.title.toLowerCase() as keyof typeof order] || 4) -
          (order[b.title.toLowerCase() as keyof typeof order] || 4);
      });

  const openFormWithPriceCard = (card: PriceCard) => {
    const srv = services.find(s => s.id === card.service);
    if (!srv) return;
    if (!user) {
      navigate('/auth/login', {
        state: { returnTo: window.location.pathname + window.location.search, message: 'Please login to continue.' },
      });
      return;
    }
    setSelectedPriceCard(card);
    setModalService(srv);
    setIsModalOpen(true);
  };

  const handleCloseDetailModal = () => setDetailService(null);
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedPriceCard(null); setModalService(null); };
  const resetFilters = () => { setSearchQuery(''); setSelectedService(null); setSelectedTier(null); };

  // FIX: unified service content — removed duplicate mobile/desktop title divs
  const renderServiceContent = (service: Service, isModal = false) => (
    <div className={`flex flex-col gap-2 ${isModal ? '' : 'mb-4 md:mb-6'}`}>
      <h2 className={`font-bold text-gray-900 dark:text-white leading-tight ${isModal ? 'text-xl md:text-2xl' : 'text-xl md:text-3xl'}`}>
        {service.title}
      </h2>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
        {service.short_description}
      </p>
      {/* long_description hidden on mobile list view, always shown in modal */}
      <div className={`prose prose-sm dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 ${isModal ? 'block' : 'hidden md:block'}`}>
        <p>{service.long_description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 md:w-12 md:h-12 text-[#015bad] animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading {slug?.replace(/-/g, ' ')}…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEOHead
        title={`${department.title} Services | OneKraft`}
        description={department.short_description || `Explore our professional ${department.title} services, pricing plans, and portfolio.`}
      />

      {/* Hero section handles its own spacing */}
      <section className="relative pt-24 pb-14 md:pt-40 md:pb-32 overflow-hidden mt-14 md:mt-20 min-h-[60vh] flex items-center">
        {/* Background Media Container */}
        <div className="absolute inset-0 z-0">
          {/* Mobile Background */}
          <div className="block md:hidden h-full w-full">
            {department.hero_bg_mobile_details ? (
              department.hero_bg_mobile_details.media_type === 'video' ? (
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src={department.hero_bg_mobile_details.url} type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${department.hero_bg_mobile_details.url})` }} />
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F44] to-[#015bad]" />
            )}
          </div>

          {/* Desktop Background */}
          <div className="hidden md:block h-full w-full">
            {department.hero_bg_desktop_details ? (
              department.hero_bg_desktop_details.media_type === 'video' ? (
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src={department.hero_bg_desktop_details.url} type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${department.hero_bg_desktop_details.url})` }} />
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F44] to-[#015bad]" />
            )}
          </div>

          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/50 z-[1]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero text removed to show background media only, dimensions preserved via section padding and min-height */}
        </div>
      </section>

      {/* ── DEPARTMENT NAVIGATOR ── FIX: horizontal scroll, hidden scrollbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 md:top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0 mr-1">Explore:</span>
          {otherDepartments.map(d => (
            <Link
              key={d.id}
              to={`/departments/${d.slug}`}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#015bad] hover:text-white transition-colors shrink-0"
            >
              {d.title}
            </Link>
          ))}
          <Link
            to="/pricing-plans"
            className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap text-[#015bad] hover:bg-[#015bad]/10 transition-colors ml-auto flex items-center gap-1 shrink-0"
          >
            All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── MAIN CONTENT ── FIX: tighter horizontal padding on small phones */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-8 lg:px-12 py-10 md:py-20 pb-20">

        {/* ── Services & Pricing header ── */}
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Services &amp; Pricing Plans
          </h2>

          {/* FIX: column layout — search full-width, tier pills scroll horizontally */}
          <div className="flex flex-col gap-3 items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#015bad] focus:border-transparent transition-all outline-none text-sm"
              />
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1 max-w-full">
              <button
                onClick={() => setSelectedTier(null)}
                className={`whitespace-nowrap shrink-0 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${selectedTier === null ? 'bg-[#015bad] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 bg-white'
                  }`}
              >All</button>
              {(['basic', 'medium', 'premium'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`whitespace-nowrap shrink-0 px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${selectedTier === tier ? 'bg-[#015bad] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 bg-white'
                    }`}
                >{tier}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Services listing ── */}
        <div className="space-y-8 md:space-y-12">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No services match your filters.</h3>
              <p className="text-gray-500 mb-4 text-sm">Try adjusting your selections above.</p>
              <button onClick={resetFilters} className="text-[#015bad] hover:underline font-medium text-sm">Clear all filters</button>
            </div>
          ) : (
            filteredServices.map((service) => {
              const serviceCards = getServiceCards(service.id);
              return (
                <div
                  key={service.id}
                  id={`service-${service.id}`}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 scroll-mt-32 overflow-hidden"
                >
                  <div className="px-4 pt-5 md:px-8 md:pt-8 lg:px-10 lg:pt-10">
                    {renderServiceContent(service)}
                  </div>

                  <div className="w-full px-4 pb-5 md:px-8 md:pb-8 lg:px-10 lg:pb-10">
                    {serviceCards.length > 0 ? (
                      <PricingCarousel
                        serviceCards={serviceCards}
                        service={service}
                        openFormWithPriceCard={openFormWithPriceCard}
                        setSelectedCardForFeatures={setSelectedCardForFeatures}
                      />
                    ) : (
                      <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 italic text-sm">
                          No plans match your current filters.{' '}
                          <button onClick={resetFilters} className="text-[#F5B041] hover:underline">Clear filters</button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Portfolio Section Moved After Services */}
        {portfolio.length > 0 && (
          <div className="mt-16 md:mt-24 mb-16 md:mb-24">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">Our {department.title} Work</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                Explore some of the projects we've built in this domain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {portfolio.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700"
                >
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-bold text-white truncate">{project.title}</h3>
                      <p className="text-[#F5B041] text-xs font-medium">{project.client_name}</p>
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{project.description}</p>
                    <Link to="/portfolio" className="inline-flex items-center gap-1 text-[#015bad] font-medium hover:underline text-sm">
                      View Portfolio <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Service Detail Modal ── FIX: dvh unit, safe sizing */}
      <Dialog open={!!detailService} onOpenChange={handleCloseDetailModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85dvh] overflow-hidden p-0 border-0 bg-white rounded-2xl">
          {detailService && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold truncate pr-4">Service Details</h3>
                <button onClick={handleCloseDetailModal} className="p-2 bg-gray-100 rounded-full shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {renderServiceContent(detailService, true)}
                <div className="mt-6">
                  <h4 className="font-bold text-base mb-4">Pricing Plans</h4>
                  <div className="space-y-4">
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
                          <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mb-3">
                            <span>{card.delivery_days} Days Delivery</span>
                            <span>{card.revisions} Revisions</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {card.features?.map((f, i) => (
                              <div key={i} className="flex gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500 shrink-0" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => { handleCloseDetailModal(); openFormWithPriceCard(card); }}
                            className="w-full py-2.5 rounded-lg bg-gray-900 text-white font-medium text-sm"
                          >
                            Choose Plan
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Features Modal ── FIX: works on mobile and desktop */}
      <Dialog open={!!selectedCardForFeatures} onOpenChange={() => setSelectedCardForFeatures(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85dvh] overflow-hidden p-0 border-0 bg-white rounded-2xl">
          {selectedCardForFeatures && (() => {
            const service = services.find(s => s.id === selectedCardForFeatures.service);
            return (
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-lg md:text-2xl font-bold text-gray-900 mb-1 truncate">
                        {service?.title}
                      </DialogTitle>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedCardForFeatures.title === 'basic' ? 'bg-blue-100 text-blue-700'
                        : selectedCardForFeatures.title === 'medium' ? 'bg-[#015bad]/10 text-[#F5B041]'
                          : 'bg-purple-100 text-purple-700'
                        }`}>
                        {selectedCardForFeatures.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F5B041]" />
                    All Features Included
                  </h3>
                  <ul className="space-y-2">
                    {selectedCardForFeatures.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600 stroke-[3]" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#015bad]/10 to-[#0A1F44]/10 border border-[#015bad]/20">
                    <div className="flex flex-wrap gap-4 text-sm">
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

                <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
                  <button
                    onClick={() => { setSelectedCardForFeatures(null); openFormWithPriceCard(selectedCardForFeatures); }}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group ${selectedCardForFeatures.title === 'medium'
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

      {/* ── Service Request Form Dialog ── FIX: dvh unit prevents modal clipping on mobile browsers */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="w-[95vw] sm:max-w-[900px] max-h-[85dvh] overflow-hidden p-0 border-0 bg-transparent">
          {modalService && selectedPriceCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#015bad] via-[#0A1F44] to-[#015bad]" />

              <div className="p-5 md:p-6 max-h-[calc(85dvh-2rem)] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {modalService.title}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 mt-1 text-sm">
                        Complete your service request
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-5">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#015bad]/10 to-[#0A1F44]/10 border border-[#015bad]/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">Selected Plan</h3>
                        <p className="text-[#0A1F44] text-sm mt-0.5 capitalize">{selectedPriceCard.title}</p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="flex items-center text-gray-500 hover:text-gray-900 font-medium text-sm"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Change
                      </button>
                    </div>
                  </motion.div>

                  <DynamicFormRenderer
                    serviceId={modalService.id}
                    priceCardId={selectedPriceCard.id}
                    onSuccess={() => {
                      handleCloseModal();
                      navigate('/client-dashboard/orders', { state: { message: '✓ Request submitted successfully!' } });
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}