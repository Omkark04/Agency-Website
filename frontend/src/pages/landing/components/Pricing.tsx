// components/Pricing.tsx - UPDATED VERSION
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, ChevronRight } from 'lucide-react';
import { listPriceCards } from '../../../api/pricecards';
import type { PriceCard } from '../../../api/pricecards';
import { listServices } from '../../../api/services';
import type { Service } from '../../../api/services';
import { Button as MovingBorderCard } from "@/components/ui/moving-border";


export const Pricing = () => {
  const [cards, setCards] = useState<PriceCard[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<number | null>(null);


  useEffect(() => {
    fetchPricingData();
  }, []);


  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const [cardsRes, servicesRes] = await Promise.all([
        listPriceCards(), // Changed from listPricingPlans
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


  // Get service name by ID
  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.title || `Service #${serviceId}`;
  };


  // Filter cards by selected service
  const filteredCards = selectedService
    ? cards.filter(card => card.service === selectedService)
    : cards;


  // Group cards by title (basic, medium, premium)
  const groupedCards = {
    basic: filteredCards.filter(card => card.title === 'basic'),
    medium: filteredCards.filter(card => card.title === 'medium'),
    premium: filteredCards.filter(card => card.title === 'premium')
  };


  // Loading skeleton
  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }


  // Get unique services for filtering
  const uniqueServices = Array.from(new Set(cards.map(c => c.service)))
    .filter(Boolean)
    .map(id => ({
      id: id!,
      title: getServiceName(id!)
    }));


  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Choose the perfect plan that fits your business needs. No hidden fees, cancel anytime.
          </p>


          {/* Service Filter */}
          {uniqueServices.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedService(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedService === null
                    ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All Services
              </button>
              {uniqueServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedService === service.id
                      ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {service.title}
                </button>
              ))}
            </div>
          )}
        </motion.div>


        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No pricing plans available
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please check back later or contact us for custom quotes.
            </p>
          </div>
        ) : (
          <>
            {/* Show cards in 3-column layout for Basic, Medium, Premium */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {/* Basic Plan */}
              {/* Basic Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                className="relative"
              >
                <MovingBorderCard
                  as="div"
                  borderRadius="1rem"
                  className="bg-white dark:bg-gray-800 border-2 border-[#0066FF]/50 text-left items-start justify-start h-full w-full p-0"
                  containerClassName="h-full w-full bg-transparent p-[3px]"
                  borderClassName="bg-[radial-gradient(#3b82f6_40%,transparent_60%)]"
                >
                  <div className="p-8 w-full">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Basic</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Perfect for getting started
                      </p>
                    </div>
                 
                    <div className="space-y-6">
                      {groupedCards.basic.map(card => (
                        <div key={card.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {getServiceName(card.service)}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {card.delivery_days || 7} days delivery • {card.revisions} revisions
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              ₹{card.price}
                            </div>
                          </div>
                         
                          {card.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {card.description}
                            </p>
                          )}
                         
                          {card.features && card.features.length > 0 && (
                            <ul className="space-y-2">
                              {card.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </li>
                              ))}
                              {card.features.length > 3 && (
                                <li className="text-xs text-blue-600 dark:text-blue-400">
                                  +{card.features.length - 3} more features
                                </li>
                              )}
                            </ul>
                          )}
                         
                          <button
                            className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all duration-300 flex items-center justify-center"
                          >
                            Get Started
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                 
                    {groupedCards.basic.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No basic plans available
                      </div>
                    )}
                  </div>
                </MovingBorderCard>
              </motion.div>


              {/* Medium Plan (Popular) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                className="relative"
              >
                <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-xs font-bold px-4 py-2 rounded-bl-lg rounded-tr-lg">
                  <Star className="h-3 w-3 inline mr-1" />
                  MOST POPULAR
                </div>
               
                <MovingBorderCard
                  as="div"
                  borderRadius="1rem"
                  className="bg-white dark:bg-gray-800 border-2 border-[#00C2A8]/50 text-left items-start justify-start h-full w-full p-0"
                  containerClassName="h-full w-full bg-transparent p-[3px]"
                  borderClassName="bg-[radial-gradient(#00C2A8_40%,transparent_60%)]"
                >
                  <div className="p-8 w-full pt-12">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Medium</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Best value for growing businesses
                      </p>
                    </div>
                   
                    <div className="space-y-6">
                      {groupedCards.medium.map(card => (
                        <div key={card.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {getServiceName(card.service)}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {card.delivery_days || 14} days delivery • {card.revisions} revisions
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              ₹{card.price}
                            </div>
                          </div>
                         
                          {card.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {card.description}
                            </p>
                          )}
                         
                          {card.features && card.features.length > 0 && (
                            <ul className="space-y-2">
                              {card.features.slice(0, 4).map((feature, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </li>
                              ))}
                              {card.features.length > 4 && (
                                <li className="text-xs text-blue-600 dark:text-blue-400">
                                  +{card.features.length - 4} more features
                                </li>
                              )}
                            </ul>
                          )}
                         
                          <button
                            className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 transition-all duration-300 flex items-center justify-center"
                          >
                            Get Started
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                   
                    {groupedCards.medium.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No medium plans available
                      </div>
                    )}
                  </div>
                </MovingBorderCard>
              </motion.div>


              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                className="relative"
              >
                <MovingBorderCard
                  as="div"
                  borderRadius="1rem"
                  className="bg-white dark:bg-gray-800 border-neutral-200 dark:border-gray-700 text-left items-start justify-start h-full w-full p-0"
                  containerClassName="h-full w-full bg-transparent p-[3px]"
                  borderClassName="bg-[radial-gradient(#a855f7_40%,transparent_60%)]"
                >
                  <div className="bg-white dark:bg-gray-800 p-8 w-full">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Premium</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Enterprise-grade solutions
                      </p>
                    </div>
                   
                    <div className="space-y-6">
                      {groupedCards.premium.map(card => (
                        <div key={card.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {getServiceName(card.service)}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {card.delivery_days || 30} days delivery • {card.revisions} revisions
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              ₹{card.price}
                            </div>
                          </div>
                         
                          {card.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {card.description}
                            </p>
                          )}
                         
                          {card.features && card.features.length > 0 && (
                            <ul className="space-y-2">
                              {card.features.slice(0, 5).map((feature, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </li>
                              ))}
                              {card.features.length > 5 && (
                                <li className="text-xs text-blue-600 dark:text-blue-400">
                                  +{card.features.length - 5} more features
                                </li>
                              )}
                            </ul>
                          )}
                         
                          <button
                            className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-all duration-300 flex items-center justify-center"
                          >
                            Get Started
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                   
                    {groupedCards.premium.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No premium plans available
                      </div>
                    )}
                  </div>
                </MovingBorderCard>
              </motion.div>
            </div>
          </>
        )}
       
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Need a custom solution? We've got you covered.
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-800 border-2 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white rounded-lg font-semibold transition-all duration-300"
          >
            <Zap className="h-5 w-5 mr-2" />
            Get a Custom Quote
          </button>
        </motion.div>
      </div>
    </section>
  );
};


export default Pricing;
