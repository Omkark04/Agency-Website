// components/Services.tsx - FIXED VERSION
import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  FaPalette, 
  FaLaptopCode, 
  FaGraduationCap, 
  FaBullhorn, 
  FaChartLine, 
  FaCode, 
  FaMobile, 
  FaBrush,
  FaChevronRight,
  FaUsers,
  FaUserTie,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { listServices } from '../../../api/services';
import { useProtectedNavigation } from '../../../hooks/useProtectedNavigation';
import type { Service } from '../../../api/services';
import { listDepartments } from '../../../api/departments';
import type { Department } from '../../../api/departments';
import { AuthModal } from './AuthModal';
import DynamicFormRenderer from '../../../components/forms/DynamicFormRenderer';


// Icon mapping from backend with more options
const iconMap = {
  'palette': <FaPalette />,
  'laptop-code': <FaLaptopCode />,
  'graduation-cap': <FaGraduationCap />,
  'megaphone': <FaBullhorn />,
  'chart-line': <FaChartLine />,
  'code': <FaCode />,
  'mobile': <FaMobile />,
  'brush': <FaBrush />,
  'users': <FaUsers />,
  'user-tie': <FaUserTie />,
  'star': <FaStar />,
  'check-circle': <FaCheckCircle />,
};

// Color mapping for icons with extended palette
const iconColorMap = {
  'palette': 'text-[#FF6B6B]',
  'laptop-code': 'text-[#4ECDC4]',
  'graduation-cap': 'text-[#45B7D1]',
  'megaphone': 'text-[#FFD166]',
  'chart-line': 'text-[#06D6A0]',
  'code': 'text-[#118AB2]',
  'mobile': 'text-[#EF476F]',
  'brush': 'text-[#073B4C]',
  'users': 'text-[#7209B7]',
  'user-tie': 'text-[#3A86FF]',
  'star': 'text-[#FFBE0B]',
  'check-circle': 'text-[#FB5607]',
};



export const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { navigateTo, showAuthModal: showAuthFromHook, setShowAuthModal: setShowAuthFromHook } = useProtectedNavigation();
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const [servicesResponse, departmentsResponse] = await Promise.all([
        listServices({ 
          is_active: true,
          is_featured: true 
        }),
        listDepartments({ is_active: true })
      ]);
      setServices(servicesResponse.data);
      setDepartments(departmentsResponse.data);
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
          <div className="text-center mb-16">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-full w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-20 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="inline-block p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
            <button 
              onClick={fetchServices}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry Loading Services
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-xs md:text-sm font-semibold tracking-wide mb-3 md:mb-4">
            Our Services
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent px-4 tracking-tight leading-tight">
            Comprehensive Solutions Tailored for Your Success
          </h2>
          <p className="hidden md:block text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            We offer a wide range of professional services across multiple departments, 
            each led by industry experts committed to delivering exceptional results.
          </p>
        </motion.div>

        {/* Services Grid - Department Based */}
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((department, index) => {
            // Get top 3 services from this department
            const departmentServices = services.filter(s => s.department === department.id).slice(0, 3);
            
            // Use first service for icon/color theming, or defaults if no services
            const firstService = departmentServices[0];
            const IconComponent = firstService 
              ? (iconMap[firstService.icon_name as keyof typeof iconMap] || iconMap['palette'])
              : iconMap['palette'];
            const iconColor = firstService
              ? (iconColorMap[firstService.icon_name as keyof typeof iconColorMap] || 'text-[#00C2A8]')
              : 'text-[#00C2A8]';
            
            return (
              <motion.div
                key={department.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                {/* Department Content */}
                <div className="p-8">
                  {/* Department Name & Logo - Same Line */}
                  <div className="flex items-center gap-4 mb-4">
                    {department.logo ? (
                      <img
                        src={department.logo}
                        alt={department.title}
                        width="64"
                        height="64"
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 object-contain rounded-xl flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${iconColor.replace('text-', 'bg-')}/10 flex-shrink-0`}>
                        {React.cloneElement(IconComponent, { 
                          className: `text-3xl ${iconColor}`
                        })}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight leading-tight">
                        {department.title}
                      </h3>
                    </div>
                  </div>

                  {/* Department Description */}
                  {department.short_description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {department.short_description}
                    </p>
                  )}

                  {/* All Services from this Department */}
                  {departmentServices.length > 0 ? (
                    <div className="mb-6 space-y-4">
                      {departmentServices.map((service) => {
                        const serviceIcon = iconMap[service.icon_name as keyof typeof iconMap] || iconMap['palette'];
                        const serviceIconColor = iconColorMap[service.icon_name as keyof typeof iconColorMap] || 'text-[#00C2A8]';
                        
                        return (
                          <div key={service.id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                            <div className="flex items-start gap-4 mb-3">
                              {service.logo ? (
                                <img
                                  src={service.logo}
                                  alt={service.title}
                                  width="56"
                                  height="56"
                                  loading="lazy"
                                  decoding="async"
                                  className="w-14 h-14 object-contain rounded-lg flex-shrink-0"
                                />
                              ) : (
                                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${serviceIconColor.replace('text-', 'bg-')}/10 flex-shrink-0`}>
                                  {React.cloneElement(serviceIcon, { 
                                    className: `text-2xl ${serviceIconColor}`
                                  })}
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 dark:text-white text-base mb-1 tracking-tight leading-snug">
                                  {service.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                  {service.short_description}
                                </p>
                              </div>
                            </div>
                            
                            {/* Discount Badge */}
                            {service.discount_percentage && service.discount_percentage > 0 && (
                              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md transform rotate-3">
                                {service.discount_percentage}% OFF
                              </div>
                            )}

                            {/* Service Features Preview */}
                            {service.features && service.features.length > 0 && (
                              <div className="space-y-1 ml-[4.5rem]">
                                {service.features.slice(0, 2).map((feature) => (
                                  <div key={feature.id} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="w-1 h-1 rounded-full bg-[#00C2A8] mt-1.5 flex-shrink-0"></div>
                                    <span className="line-clamp-1">{feature.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No services available yet
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        if (user) {
                          navigate('/client-dashboard/services');
                        } else {
                          navigate('/pricing-plans');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white font-semibold tracking-wide hover:shadow-xl hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <span>Check Services</span>
                      <FaChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const contactSection = document.getElementById('contact');
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold tracking-wide hover:border-[#00C2A8] hover:text-[#00C2A8] dark:hover:text-[#00C2A8] transition-all duration-300"
                    >
                      <span>Make Custom Order</span>
                    </button>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: Horizontal Scrollable Cards */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 pb-4">
          {departments.map((department, index) => {
            // Get top 3 services from this department
            const departmentServices = services.filter(s => s.department === department.id).slice(0, 3);
            
            // Use first service for icon/color theming, or defaults if no services
            const firstService = departmentServices[0];
            const IconComponent = firstService 
              ? (iconMap[firstService.icon_name as keyof typeof iconMap] || iconMap['palette'])
              : iconMap['palette'];
            const iconColor = firstService
              ? (iconColorMap[firstService.icon_name as keyof typeof iconColorMap] || 'text-[#00C2A8]')
              : 'text-[#00C2A8]';
            
            return (
              <motion.div
                key={department.id}
                className="flex-shrink-0 w-[300px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Department Content */}
                <div className="p-5">
                  {/* Department Name & Logo */}
                  <div className="flex items-center gap-3 mb-4">
                    {department.logo ? (
                      <img
                        src={department.logo}
                        alt={department.title}
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-12 object-contain rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor.replace('text-', 'bg-')}/10 flex-shrink-0`}>
                        {React.cloneElement(IconComponent, { 
                          className: `text-2xl ${iconColor}`
                        })}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 tracking-tight leading-tight">
                        {department.title}
                      </h3>
                    </div>
                  </div>

                  {/* Top 3 Services */}
                  {departmentServices.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {departmentServices.map((service) => {
                        const serviceIcon = iconMap[service.icon_name as keyof typeof iconMap] || iconMap['palette'];
                        const serviceIconColor = iconColorMap[service.icon_name as keyof typeof iconColorMap] || 'text-[#00C2A8]';
                        
                        return (
                          <div key={service.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                            {service.logo ? (
                              <img
                                src={service.logo}
                                alt={service.title}
                                width="32"
                                height="32"
                                loading="lazy"
                                decoding="async"
                                className="w-8 h-8 object-contain rounded flex-shrink-0"
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded flex items-center justify-center ${serviceIconColor.replace('text-', 'bg-')}/10 flex-shrink-0`}>
                                {React.cloneElement(serviceIcon, { 
                                  className: `text-base ${serviceIconColor}`
                                })}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 tracking-tight leading-snug">
                                {service.title}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (user) {
                          navigate('/client-dashboard/services');
                        } else {
                          navigate('/pricing-plans');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-sm font-semibold tracking-wide hover:shadow-lg transition-all duration-300"
                    >
                      <span>Check Services</span>
                      <FaChevronRight className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const contactSection = document.getElementById('contact');
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold tracking-wide hover:border-[#00C2A8] hover:text-[#00C2A8] transition-all duration-300"
                    >
                      <span>Make Custom Order</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Border */}
                <div className="h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF]" />
              </motion.div>
            );
          })}
        </div>
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
              <FaBullhorn className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Services Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                No services are currently available.
              </p>
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div 
          className="mt-12 md:mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#0066FF] to-purple-500">
            <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-6 md:px-8 md:py-8">
              <h3 className="text-lg md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent tracking-tight">
                Ready to Transform Your Business?
              </h3>
              <p className="hidden md:block text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto text-lg leading-relaxed">
                Our expert teams are ready to deliver exceptional results. 
                Get a personalized consultation and discover how we can help you achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold tracking-wide hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
                >
                  Get a Custom Quote
                </button>
                <button
                  onClick={() => navigateTo('/client-dashboard/services')}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 px-6 py-2.5 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold tracking-wide hover:shadow-lg transition-all duration-300"
                >
                  View All Services
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Auth Modal */}
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={() => setShowAuthModal(false)} 
    />

    {/* Form Modal */}
    {showFormModal && selectedServiceId && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] my-8 shadow-2xl flex flex-col">
          {/* Enhanced Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] p-6 flex items-center justify-between z-10 rounded-t-2xl">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {services.find(s => s.id === selectedServiceId)?.title || 'Service'} Request
              </h2>
              <p className="text-white/90 text-sm">
                Fill out the form below to get started with this service
              </p>
              {services.find(s => s.id === selectedServiceId)?.starting_price ? (
                <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-semibold">
                    Starting at ₹{services.find(s => s.id === selectedServiceId)?.starting_price?.toLocaleString()}
                  </span>
                  {services.find(s => s.id === selectedServiceId)?.original_price && services.find(s => s.id === selectedServiceId)?.starting_price && services.find(s => s.id === selectedServiceId)!.original_price! > services.find(s => s.id === selectedServiceId)!.starting_price! && (
                    <span className="text-white/70 text-xs line-through">
                      ₹{services.find(s => s.id === selectedServiceId)?.original_price?.toLocaleString()}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
            <button
              onClick={() => {
                setShowFormModal(false);
                setSelectedServiceId(null);
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-4"
            >
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <DynamicFormRenderer 
              serviceId={selectedServiceId}
              onSuccess={(orderId) => {
                console.log('Order created:', orderId);
                // Close modal after successful submission
                setTimeout(() => {
                  setShowFormModal(false);
                  setSelectedServiceId(null);
                }, 3000);
              }}
            />
          </div>
        </div>
      </div>
    )}
    
    {/* Auth Modal for Protected Navigation */}
    <AuthModal 
      isOpen={showAuthFromHook} 
      onClose={() => setShowAuthFromHook(false)} 
      defaultMode="login"
    />
  </>
  );
};

export default Services;