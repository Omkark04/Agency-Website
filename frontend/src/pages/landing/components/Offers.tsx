// components/Offers.tsx - DYNAMIC VERSION
import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Award, Shield, Users, Sparkles, Clock, Tag } from 'lucide-react';
import { listSpecialOffers, getCurrentDeal } from '../../../api/offers';
import type { SpecialOffer } from '../../../api/offers';

// Icon mapping
const iconMap = {
  'zap': <Zap className="w-8 h-8" />,
  'award': <Award className="w-8 h-8" />,
  'shield': <Shield className="w-8 h-8" />,
  'users': <Users className="w-8 h-8" />,
  'sparkles': <Sparkles className="w-8 h-8" />,
  'clock': <Clock className="w-8 h-8" />,
  'tag': <Tag className="w-8 h-8" />,
};

// Color mapping
const iconColorMap = {
  'zap': 'text-blue-500',
  'award': 'text-amber-500',
  'shield': 'text-emerald-500',
  'users': 'text-purple-500',
  'sparkles': 'text-pink-500',
  'clock': 'text-orange-500',
  'tag': 'text-indigo-500',
};

const OfferCard = ({ offer, index }: { offer: SpecialOffer; index: number }) => {
  const IconComponent = iconMap[offer.icon_name as keyof typeof iconMap] || iconMap['zap'];
  const iconColor = iconColorMap[offer.icon_name as keyof typeof iconColorMap] || 'text-blue-500';
  
  // Check if offer is expiring soon
  const validUntil = new Date(offer.valid_until);
  const today = new Date();
  const daysRemaining = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 ${
        offer.is_limited_time ? 'border-2 border-yellow-200 dark:border-yellow-800' : ''
      }`}
    >
      {offer.is_limited_time && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Limited Time!
        </div>
      )}
      
      {isExpiringSoon && (
        <div className="absolute -top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
        </div>
      )}

      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-4">
        <div className={iconColor}>
          {React.cloneElement(IconComponent, { className: `w-8 h-8 ${iconColor}` })}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {offer.title}
        {offer.discount_percentage && (
          <span className="ml-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-2 py-0.5 rounded">
            {offer.discount_percentage}% OFF
          </span>
        )}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">{offer.description}</p>
      
      <ul className="space-y-2 mb-6">
        {offer.features.slice(0, 3).map((feature: string, i: number) => (
          <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
        {offer.features.length > 3 && (
          <li className="text-sm text-gray-500 dark:text-gray-400">
            +{offer.features.length - 3} more benefits
          </li>
        )}
      </ul>

      {offer.discount_code && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Use code:</div>
          <div className="font-mono text-lg font-bold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
            {offer.discount_code}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (offer.button_url) {
            window.location.href = offer.button_url;
          } else {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg"
      >
        {offer.button_text}
      </button>

      {offer.conditions && offer.conditions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            *{offer.conditions[0]}
            {offer.conditions.length > 1 && (
              <span className="ml-1 cursor-help" title={offer.conditions.slice(1).join(', ')}>
                See details
              </span>
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export const Offers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [currentDeal, setCurrentDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'limited' | 'featured'>('all');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const [offersRes, dealRes] = await Promise.all([
        listSpecialOffers({ is_active: true }),
        getCurrentDeal()
      ]);
      setOffers(offersRes.data);
      setCurrentDeal(dealRes.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter offers
  const filteredOffers = offers.filter(offer => {
    if (filter === 'limited') return offer.is_limited_time;
    if (filter === 'featured') return offer.is_featured;
    return true;
  });

  // Loading skeleton
  if (loading) {
    return (
      <section id="offers" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-4"></div>
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
            Special Offers
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Exclusive Deals & Offers
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Take advantage of our exclusive offers designed to help your business grow faster and smarter.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { key: 'all', label: 'All Offers' },
              { key: 'featured', label: 'Featured', icon: Award },
              { key: 'limited', label: 'Limited Time', icon: Clock },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.key}
                  onClick={() => setFilter(btn.key as any)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${
                    filter === btn.key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
        
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No offers available
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {filter !== 'all' 
                ? 'Try changing your filter to see more offers'
                : 'Check back later for new offers!'}
            </p>
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition-all"
            >
              View All Offers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredOffers.map((offer, index) => (
              <OfferCard key={offer.id} offer={offer} index={index} />
            ))}
          </div>
        )}

        {/* Limited Time Deal Banner */}
        {currentDeal && currentDeal.is_active && (
          <motion.div 
            className="mt-16 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 -mt-32 -mr-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full opacity-20 -mb-32 -ml-32"></div>
            
            <div className="relative z-10 max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Sparkles className="w-6 h-6 text-yellow-300" />
                    </div>
                    <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      Limited Time Offer
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-3">{currentDeal.title}</h3>
                  <p className="text-blue-100 text-lg mb-4">{currentDeal.subtitle}</p>
                  <p className="text-blue-200 mb-6">{currentDeal.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                        {currentDeal.discount_percentage}% OFF
                      </div>
                      {currentDeal.original_price && currentDeal.discounted_price && (
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold line-through opacity-70">
                            ₹{currentDeal.original_price}
                          </span>
                          <span className="text-3xl font-black">
                            ₹{currentDeal.discounted_price}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {currentDeal.remaining_days} days remaining
                      </span>
                    </div>
                  </div>
                  
                  {currentDeal.features && currentDeal.features.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {currentDeal.features.map((feature: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-300" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="lg:w-1/3 text-center lg:text-right">
                  <button className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105">
                    {currentDeal.button_text}
                  </button>
                  <p className="text-blue-200 text-sm mt-3">
                    *Limited spots available. Offer ends soon!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Animated countdown timer */}
            {currentDeal.remaining_days > 0 && (
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-sm text-blue-200 mb-2">Offer ends in:</div>
                  <div className="flex justify-center gap-4">
                    {[
                      { label: 'Days', value: Math.floor(currentDeal.remaining_days) },
                      { label: 'Hours', value: 23 },
                      { label: 'Minutes', value: 59 },
                      { label: 'Seconds', value: 59 },
                    ].map((unit, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold">{unit.value}</span>
                        </div>
                        <span className="text-xs text-blue-200 mt-2">{unit.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Don't see an offer that fits your needs? Contact us for a personalized deal.
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Users className="w-5 h-5" />
            Request Custom Offer
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Offers;