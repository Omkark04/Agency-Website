import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, ChevronRight, ArrowRight, Clock, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listPriceCards } from '../../../api/pricecards';
import type { PriceCard } from '../../../api/pricecards';
import { listServices } from '../../../api/services';
import type { Service } from '../../../api/services';
import { Button as MovingBorderContainer } from "@/components/ui/moving-border";
import DynamicFormRenderer from '../../../components/forms/DynamicFormRenderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Pricing = () => {
  const [cards, setCards] = useState<PriceCard[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal state for form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceCard, setSelectedPriceCard] = useState<PriceCard | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const [cardsRes, servicesRes] = await Promise.all([
        listPriceCards(),
        listServices({ is_active: true })
      ]);
      setCards(cardsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getService = (serviceId: number) => {
    return services.find(s => s.id === serviceId);
  };

  const getSelectedServiceCards = (): PriceCard[] => {
    const departmentMap = new Map<number, number>();
    
    const servicesByDept = new Map<number, number[]>();
    services.forEach(service => {
      if (!servicesByDept.has(service.department)) {
        servicesByDept.set(service.department, []);
      }
      servicesByDept.get(service.department)!.push(service.id);
    });

    servicesByDept.forEach((serviceIds, deptId) => {
      let selectedServiceId: number | null = null;
      let maxPlans = 0;

      for (const serviceId of serviceIds) {
        const serviceCards = cards.filter(c => c.service === serviceId && c.is_active);
        const tierCount = serviceCards.length;
        
        if (tierCount === 0) continue;
        
        const hasBasic = serviceCards.some(c => c.title === 'basic');
        const hasMedium = serviceCards.some(c => c.title === 'medium');
        const hasPremium = serviceCards.some(c => c.title === 'premium');
        
        if (hasBasic && hasMedium && hasPremium) {
          selectedServiceId = serviceId;
          maxPlans = tierCount;
          break;
        }
        
        if (tierCount > maxPlans) {
          maxPlans = tierCount;
          selectedServiceId = serviceId;
        }
      }

      if (selectedServiceId && maxPlans > 0) {
        departmentMap.set(deptId, selectedServiceId);
      }
    });

    const selectedServiceIds = Array.from(departmentMap.values());
    return cards.filter(c => selectedServiceIds.includes(c.service) && c.is_active);
  };

  const displayCards = getSelectedServiceCards();

  const cardsByDepartment = new Map<string, { deptId: number; cards: PriceCard[] }>();
  displayCards.forEach(card => {
    const service = getService(card.service);
    if (!service) return;
    
    const deptName = service.department_title || 'Other Services';
    const deptId = service.department;
    
    if (!cardsByDepartment.has(deptName)) {
      cardsByDepartment.set(deptName, { deptId, cards: [] });
    }
    cardsByDepartment.get(deptName)!.cards.push(card);
  });

  const tierOrder = { basic: 1, medium: 2, premium: 3 };
  cardsByDepartment.forEach(dept => {
    dept.cards.sort((a, b) => tierOrder[a.title] - tierOrder[b.title]);
  });

  // Handler to open form with pre-selected price card (bypasses price selection)
  const openFormWithPriceCard = (card: PriceCard) => {
    const service = getService(card.service);
    if (!service) return;
    
    setSelectedPriceCard(card);
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPriceCard(null);
    setSelectedService(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2A8]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-gradient-to-r from-[#00C2A8]/20 to-[#0066FF]/20 text-[#00C2A8] dark:text-[#00C2A8] text-xs md:text-sm font-semibold tracking-wide mb-3 md:mb-4">
              <Sparkles className="inline-block w-3 h-3 md:w-4 md:h-4 mr-2" />
              Pricing Plans
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight leading-tight px-4">
              Simple, Transparent Pricing
            </h2>
            <p className="hidden md:block text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan that fits your business needs. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          {displayCards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl mb-6">
                <Zap className="w-16 h-16 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Pricing Plans Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Please check back later or contact us for custom quotes.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop: Department-based Grid */}
              <div className="hidden md:block">
                {Array.from(cardsByDepartment.entries()).map(([deptName, { deptId, cards: deptCards }], deptIndex) => (
                  <div key={deptId} className="mb-16 last:mb-8">
                    {/* Department Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-10"
                    >
                      <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">
                        {deptName}
                      </h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] mx-auto rounded-full"></div>
                    </motion.div>

                    {/* Cards Grid */}
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                    {deptCards.map((card, cardIndex) => {
                      const service = getService(card.service);
                      if (!service) return null;

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
                                {/* Service Name */}
                                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 line-clamp-1">
                                  {service.title}
                                </h4>

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
                                      {card.features.slice(0, card.title === 'premium' ? 5 : card.title === 'medium' ? 4 : 3).map((feature, idx) => (
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
                                      {card.features.length > (card.title === 'premium' ? 5 : card.title === 'medium' ? 4 : 3) && (
                                        <li className="text-sm text-[#00C2A8] dark:text-[#00C2A8] font-medium ml-7">
                                          +{card.features.length - (card.title === 'premium' ? 5 : card.title === 'medium' ? 4 : 3)} more features
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
                </div>
              ))}
              </div>

              {/* Mobile: Service-based Horizontal Scroll */}
              <div className="md:hidden space-y-8">
                {(() => {
                  // Group cards by service
                  const cardsByService = new Map<number, { service: Service; cards: PriceCard[] }>();
                  displayCards.forEach(card => {
                    const service = getService(card.service);
                    if (!service) return;
                    
                    if (!cardsByService.has(card.service)) {
                      cardsByService.set(card.service, { service, cards: [] });
                    }
                    cardsByService.get(card.service)!.cards.push(card);
                  });

                  // Sort cards within each service
                  cardsByService.forEach(group => {
                    group.cards.sort((a, b) => tierOrder[a.title] - tierOrder[b.title]);
                  });

                  return Array.from(cardsByService.values()).map(({ service, cards: serviceCards }) => (
                    <div key={service.id} className="mb-8">
                      {/* Service Title */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mb-4 px-4"
                      >
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight leading-tight">
                          {service.title}
                        </h3>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] mt-2 rounded-full"></div>
                      </motion.div>

                      {/* Horizontal Scrollable Cards */}
                      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-4 pb-4">
                          {serviceCards.map((card, index) => {
                            const isPopular = card.title === 'medium';

                            return (
                              <motion.div
                                key={card.id}
                                className="flex-shrink-0 w-[280px]"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                              >
                                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full">
                                  {/* Popular Badge */}
                                  {isPopular && (
                                    <div className="absolute top-3 left-3 z-10">
                                      <div className="px-2 py-1 rounded-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <Star className="w-3 h-3 fill-current" />
                                        POPULAR
                                      </div>
                                    </div>
                                  )}

                                  {/* Tier Badge */}
                                  <div className="absolute top-3 right-3 z-10">
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
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
                                  <div className="p-5 pt-14">
                                    {/* Price */}
                                    <div className="mb-4">
                                      <div className="text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        ₹{parseFloat(card.price).toLocaleString('en-IN')}
                                      </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700">
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-[#00C2A8]" />
                                        <div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">Delivery</div>
                                          <div className="text-xs font-semibold text-gray-800 dark:text-white">
                                            {card.delivery_days || 7} days
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <RefreshCw className="w-3 h-3 text-[#0066FF]" />
                                        <div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">Revisions</div>
                                          <div className="text-xs font-semibold text-gray-800 dark:text-white">
                                            {card.revisions}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Features - Limited for mobile */}
                                    {card.features && card.features.length > 0 && (
                                      <div className="mb-4">
                                        <ul className="space-y-2">
                                          {card.features.slice(0, 3).map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                              <div className="flex-shrink-0 mt-0.5">
                                                <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                  <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400 stroke-[3]" />
                                                </div>
                                              </div>
                                              <span className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">
                                                {feature}
                                              </span>
                                            </li>
                                          ))}
                                          {card.features.length > 3 && (
                                            <li className="text-xs text-[#00C2A8] dark:text-[#00C2A8] font-medium ml-6">
                                              +{card.features.length - 3} more
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                    {/* CTA Button */}
                                    <button
                                      onClick={() => openFormWithPriceCard(card)}
                                      className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                                        card.title === 'basic'
                                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                          : card.title === 'medium'
                                          ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF]'
                                          : 'bg-gradient-to-r from-purple-600 to-pink-600'
                                      }`}
                                    >
                                      Get Started
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Bottom Border */}
                                  <div className={`h-1 bg-gradient-to-r ${
                                    card.title === 'basic'
                                      ? 'from-blue-600 to-purple-600'
                                      : card.title === 'medium'
                                      ? 'from-[#00C2A8] to-[#0066FF]'
                                      : 'from-purple-600 to-pink-600'
                                  }`}></div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* View All Plans Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => navigate('/pricing-plans')}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:from-[#00A58E] hover:to-[#0052CC] text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
                >
                  <span>View All Pricing Plans</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </>
          )}
         
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 md:mt-20"
          >
            <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#0066FF] to-purple-500">
              <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-6 md:px-8 md:py-6">
                <h3 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent tracking-tight">
                  Need a Custom Solution?
                </h3>
                <p className="hidden md:block text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  We've got you covered. Contact us for a personalized quote tailored to your specific needs.
                </p>
                <button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold tracking-wide hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
                >
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  Get a Custom Quote
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent">
          {selectedService && selectedPriceCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl rounded-3xl shadow-3xl overflow-hidden"
            >
              {/* Modal header gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
             
              <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {selectedService.title}
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
                    serviceId={selectedService.id}
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
};

export default Pricing;
