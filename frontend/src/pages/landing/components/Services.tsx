// components/Services.tsx - FIXED VERSION
import { useState, useEffect } from 'react';
import React from 'react';
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
import { FiClock, FiUsers as FiUsersIcon, FiTrendingUp, FiX } from 'react-icons/fi';
import { listServices } from '../../../api/services';
import type { Service } from '../../../api/services';
import { useAuth } from '../../../hooks/useAuth';
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

// Background color mapping
const bgColorMap = {
  'palette': 'bg-gradient-to-br from-red-50 to-pink-50',
  'laptop-code': 'bg-gradient-to-br from-teal-50 to-cyan-50',
  'graduation-cap': 'bg-gradient-to-br from-blue-50 to-cyan-50',
  'megaphone': 'bg-gradient-to-br from-yellow-50 to-orange-50',
  'chart-line': 'bg-gradient-to-br from-green-50 to-emerald-50',
  'code': 'bg-gradient-to-br from-sky-50 to-blue-50',
  'mobile': 'bg-gradient-to-br from-rose-50 to-pink-50',
  'brush': 'bg-gradient-to-br from-gray-50 to-slate-50',
  'users': 'bg-gradient-to-br from-purple-50 to-violet-50',
  'user-tie': 'bg-gradient-to-br from-indigo-50 to-blue-50',
  'star': 'bg-gradient-to-br from-amber-50 to-yellow-50',
  'check-circle': 'bg-gradient-to-br from-orange-50 to-red-50',
};

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await listServices({ 
        is_active: true,
        is_featured: true 
      });
      setServices(response.data);
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
        <div className="container mx-auto px-4 max-w-7xl">
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
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-sm font-semibold mb-4">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Comprehensive Solutions Tailored for Your Success
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            We offer a wide range of professional services across multiple departments, 
            each led by industry experts committed to delivering exceptional results.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon_name as keyof typeof iconMap] || iconMap['palette'];
            const iconColor = iconColorMap[service.icon_name as keyof typeof iconColorMap] || 'text-[#00C2A8]';
            const bgColor = bgColorMap[service.icon_name as keyof typeof bgColorMap] || 'bg-gradient-to-br from-gray-50 to-slate-50';
            
            return (
              <motion.div
                key={service.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                {/* Service Logo/Header */}
                <div className={`relative h-48 ${bgColor} dark:opacity-90 overflow-hidden`}>
                  {service.logo ? (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <img
                        src={service.logo}
                        alt={service.title}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${iconColor.replace('text-', 'bg-')}/10 mb-4`}>
                        {React.cloneElement(IconComponent, { 
                          className: `text-4xl ${iconColor}`
                        })}
                      </div>
                      <div className={`h-1 w-16 rounded-full ${service.gradient_colors || 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF]'}`}></div>
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {service.is_featured && (
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold flex items-center gap-1">
                        <FaStar className="w-3 h-3" />
                        Featured
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-8">
                  {/* Service Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">
                      {service.title}
                    </h3>
                    {service.department_title && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 mt-2 inline-block">
                        {service.department_title}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                    {service.short_description}
                  </p>

                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <FaCheckCircle className="w-4 h-4 text-[#00C2A8]" />
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {(service.features || []).slice(0, 3).map((feature) => (
                        <li key={feature.id} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] mt-1.5 flex-shrink-0"></div>
                          <span className="line-clamp-1">{feature.title}</span>
                        </li>
                      ))}
                      {(service.features || []).length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          +{(service.features || []).length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Service Stats */}
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        <FiClock className="inline-block w-4 h-4 mr-1 text-[#00C2A8]" />
                        Quick
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Delivery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        <FiUsersIcon className="inline-block w-4 h-4 mr-1 text-[#0066FF]" />
                        Expert
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Team</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        <FiTrendingUp className="inline-block w-4 h-4 mr-1 text-[#00C2A8]" />
                        Results
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Driven</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => {
                      // Require authentication to fill form
                      if (!isAuthenticated) {
                        setShowAuthModal(true);
                      } else {
                        // Open form modal
                        setSelectedServiceId(service.id);
                        setShowFormModal(true);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-[#00C2A8] hover:to-[#0066FF] hover:text-white transition-all duration-300 group-hover:shadow-lg"
                  >
                    <span className="font-semibold">Learn More</span>
                    <FaChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </motion.div>
            );
          })}
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
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#0066FF] to-purple-500">
            <div className="bg-white dark:bg-gray-900 rounded-xl px-8 py-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">
                Ready to Transform Your Business?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto text-lg">
                Our expert teams are ready to deliver exceptional results. 
                Get a personalized consultation and discover how we can help you achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
                >
                  Get a Custom Quote
                </button>
                <button
                  onClick={fetchServices}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">
              Service Inquiry Form
            </h2>
            <button
              onClick={() => {
                setShowFormModal(false);
                setSelectedServiceId(null);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          <div className="p-6">
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
  </>
  );
};

export default Services;