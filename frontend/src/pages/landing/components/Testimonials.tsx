// components/Testimonials.tsx - UPDATED CARD VERSION
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star, MessageSquarePlus, Sparkles, Award, Heart } from 'lucide-react';
import { listTestimonials, createTestimonial } from '../../../api/testinomials';
import type { TestimonialSubmission, Testimonial } from '../../../api/testinomials';
import { listServices } from '../../../api/services';
import { getTestimonialStats } from '../../../api/testinomials';


const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 150,
    average_rating: 4.9,
    satisfaction: 98
  });
  const [formData, setFormData] = useState<TestimonialSubmission>({
    client_name: '',
    client_role: '',
    client_company: '',
    content: '',
    rating: 5,
    email: '',
    phone: '',
    project_type: '',
    service: undefined,
    consent_to_display: true,
  });

  useEffect(() => {
    fetchTestimonials();
    fetchServices();
    fetchStats();
    
    // Auto-advance
    const timer = setInterval(() => {
      nextTestimonial();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await listServices({ is_active: true });
      const servicesData = Array.isArray(response.data) 
        ? response.data 
        : ((response.data as any).results || []);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTestimonialStats();
      setStats({
        total: response.data.total,
        average_rating: response.data.average_rating,
        satisfaction: Math.round((response.data.average_rating / 5) * 100)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await listTestimonials({ 
        is_approved: true,
        is_featured: true,
        limit: 10 
      });
      setTestimonials(response.data);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      if (error.response?.status === 404) {
        console.log('Testimonials API not available - using fallback');
        setTestimonials([]);
      } else {
        setTestimonials([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setDirection(0);
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTestimonial(formData);
      alert('Thank you for your testimonial! It will be reviewed before publishing.');
      setFormData({
        client_name: '',
        client_role: '',
        client_company: '',
        content: '',
        rating: 5,
        email: '',
        phone: '',
        project_type: '',
        service: undefined,
        consent_to_display: true,
      });
      setShowForm(false);
      setTimeout(() => fetchTestimonials(), 2000);
    } catch (error) {
      alert('Failed to submit testimonial. Please try again.');
      console.error('Error submitting testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading && testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20 bg-gradient-to-b from-[#0B2545] via-[#0F2B4F] to-[#0B2545] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid opacity-30" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="h-10 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse rounded w-80 mx-auto mb-4"></div>
              <div className="h-4 bg-white/20 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-[#0B2545] via-[#0F2B4F] to-[#0B2545] text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid opacity-30" />
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span className="text-sm text-cyan-300 font-medium">Trusted by Industry Leaders</span>
            <Sparkles className="h-4 w-4 text-cyan-300" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
            Client Success Stories
          </h2>
          
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Discover why industry leaders choose us. Real results from real partnerships.
          </p>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-300">{stats.satisfaction}%</div>
              <div className="text-sm text-gray-400">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-300">{stats.average_rating.toFixed(1)}/5</div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-300">{stats.total}+</div>
              <div className="text-sm text-gray-400">Happy Clients</div>
            </div>
          </div>

          {/* Add testimonial button */}
          <motion.button
            onClick={() => setShowForm(true)}
            className="mt-8 group relative inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <MessageSquarePlus className="h-5 w-5" />
            Share Your Experience
          </motion.button>
        </motion.div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <MessageSquarePlus className="h-12 w-12 text-cyan-300" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Be the First to Share</h3>
            <p className="text-gray-300 mb-6">Share your experience and inspire others!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 px-8 rounded-full transition-all duration-300"
            >
              Share Your Story
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Infinite Slider - Improved Marquee */}
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite;
              }
              /* Hover pause is handled by Tailwind class hover:[animation-play-state:paused] used below, 
                 or we can add it here explicitly if Tailwind JIT isn't picking it up */
              .animate-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="hidden lg:block relative group">
              {/* Gradient Edges */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0B2545] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0B2545] to-transparent z-10 pointer-events-none" />

              <div className="overflow-hidden">
                <div 
                  className="flex gap-8 w-max animate-marquee"
                >
                  {/* Render Double for infinite loop */}
                  {[...testimonials, ...testimonials].map((testimonial, index) => (
                    <div
                        key={`${testimonial.id}-marquee-${index}`}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="relative group/card flex-shrink-0 w-[400px]"
                      >
                        {/* Animated Border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover/card:opacity-100 blur transition duration-500 group-hover/card:duration-200" />
                        
                        <div className="relative bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full overflow-hidden">
                          {/* Background Pattern */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                          
                          {/* Top Section */}
                          <div className="relative z-10">
                            {/* Quote Icon */}
                            <div className="absolute -top-4 -left-4">
                              <Quote className="h-12 w-12 text-cyan-300/20" />
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center mb-6">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-500/50 text-gray-500/50'}`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-400">({testimonial.rating}/5)</span>
                            </div>
                            
                            {/* Content */}
                            <p className="text-gray-200 mb-8 line-clamp-4 group-hover/card:line-clamp-none transition-all duration-300">
                              "{testimonial.content}"
                            </p>
                          </div>
                          
                          {/* Client Info */}
                          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/10">
                            {testimonial.avatar_url ? (
                              <img 
                                src={testimonial.avatar_url} 
                                alt={testimonial.client_name}
                                className="h-14 w-14 rounded-full border-2 border-cyan-300/30 object-cover hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-full border-2 border-cyan-300/30 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform duration-300">
                                {testimonial.client_name.charAt(0)}
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg truncate">{testimonial.client_name}</h4>
                              <p className="text-cyan-300 text-sm truncate">{testimonial.client_role}</p>
                              {testimonial.client_company && (
                                <p className="text-gray-400 text-sm truncate">{testimonial.client_company}</p>
                              )}
                            </div>
                            
                            {testimonial.service_title && (
                              <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-300">
                                {testimonial.service_title}
                              </span>
                            )}
                          </div>
                          
                          {/* Hover Effect Indicator */}
                          <div 
                            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transition-transform duration-300 origin-left ${hoveredCard === index ? 'scale-x-100' : 'scale-x-0'}`}
                          />
                        </div>
                        
                        {/* Floating Icon on Hover */}
                        <div
                            className={`absolute -top-3 -right-3 bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-full shadow-lg transition-all duration-300 ${hoveredCard === index ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                          >
                            <Heart className="h-5 w-5 text-white fill-white" />
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Carousel */}
            <div className="lg:hidden max-w-4xl mx-auto">
              <div className="relative">
                {/* Navigation Buttons */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between z-10 px-2">
                  <button 
                    onClick={prevTestimonial}
                    className="group bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 backdrop-blur-sm p-3 rounded-full text-white transition-all duration-300 border border-white/10"
                    aria-label="Previous testimonial"
                    disabled={testimonials.length <= 1}
                  >
                    <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform duration-300" />
                  </button>
                  <button 
                    onClick={nextTestimonial}
                    className="group bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 backdrop-blur-sm p-3 rounded-full text-white transition-all duration-300 border border-white/10"
                    aria-label="Next testimonial"
                    disabled={testimonials.length <= 1}
                  >
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>

                <div className="relative h-[500px] overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    {testimonials[currentIndex] && (
                      <motion.div
                        key={testimonials[currentIndex].id}
                        custom={direction}
                        initial={{ opacity: 0, x: direction === 0 ? 100 : -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction === 0 ? -100 : 100 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <div className="relative bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full overflow-hidden">
                          {/* Animated Border */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-2xl opacity-30 animate-pulse" />
                          
                          {/* Content */}
                          <div className="relative z-10 h-full flex flex-col">
                            <div className="flex-1">
                              <Quote className="h-12 w-12 text-cyan-300/20 mb-6" />
                              <div className="flex items-center mb-6">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-6 w-6 ${i < testimonials[currentIndex].rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-500/50 text-gray-500/50'}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xl text-gray-200 mb-8">
                                "{testimonials[currentIndex].content}"
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4 pt-8 border-t border-white/10">
                              {testimonials[currentIndex].avatar_url ? (
                                <img 
                                  src={testimonials[currentIndex].avatar_url} 
                                  alt={testimonials[currentIndex].client_name}
                                  className="h-16 w-16 rounded-full border-2 border-cyan-300/30 object-cover"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-full border-2 border-cyan-300/30 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                  {testimonials[currentIndex].client_name.charAt(0)}
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-bold text-lg">{testimonials[currentIndex].client_name}</h4>
                                <p className="text-cyan-300">{testimonials[currentIndex].client_role}</p>
                                {testimonials[currentIndex].client_company && (
                                  <p className="text-gray-400 text-sm">{testimonials[currentIndex].client_company}</p>
                                )}
                              </div>
                            </div>
                            
                            {testimonials[currentIndex].service_title && (
                              <div className="mt-6">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-300">
                                  <Award className="h-4 w-4" />
                                  {testimonials[currentIndex].service_title}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center mt-8 space-x-2">
                  {testimonials.slice(0, 6).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > currentIndex ? 0 : 1);
                        setCurrentIndex(index);
                      }}
                      className={`relative h-2 rounded-full transition-all duration-300 overflow-hidden ${
                        index === currentIndex ? 'w-8' : 'w-3'
                      }`}
                    >
                      <div className={`absolute inset-0 ${
                        index === currentIndex 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Testimonial Submission Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Form Header */}
                <div className="relative p-6 border-b border-gray-700">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Share Your Journey
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">Help others discover our impact</p>
                    </div>
                    <button 
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmitTestimonial} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={formData.client_role}
                        onChange={(e) => setFormData({...formData, client_role: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                        placeholder="CEO, Manager, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.client_company}
                      onChange={(e) => setFormData({...formData, client_company: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Service *
                    </label>
                    <select
                      required
                      value={formData.service || ''}
                      onChange={(e) => setFormData({...formData, service: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 appearance-none"
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Experience *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 resize-none"
                      placeholder="Tell us about your experience working with us..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rating *
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({...formData, rating})}
                          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`${rating <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-700 text-gray-700'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-xl">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={formData.consent_to_display}
                      onChange={(e) => setFormData({...formData, consent_to_display: e.target.checked})}
                      className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-400">
                      I consent to have my testimonial displayed on your website to help others make informed decisions
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full group relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {submitting ? 'Submitting...' : 'Share Your Story'}
                      <MessageSquarePlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Testimonials;