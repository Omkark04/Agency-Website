// components/Testimonials.tsx - DYNAMIC VERSION
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star, MessageSquarePlus } from 'lucide-react';
import { listTestimonials, createTestimonial } from '../../../api/testinomials';
import type { TestimonialSubmission, Testimonial } from '../../../api/testinomials';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<TestimonialSubmission>({
    client_name: '',
    client_role: '',
    client_company: '',
    content: '',
    rating: 5,
    email: '',
    phone: '',
    project_type: '',
    consent_to_display: true,
  });

  useEffect(() => {
    fetchTestimonials();
    
    // Auto-advance
    const timer = setInterval(() => {
      nextTestimonial();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

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
      // Handle 404 or other API errors gracefully
      if (error.response?.status === 404) {
        console.log('Testimonials API not available - using fallback');
        // Set empty array to show "no testimonials" state
        setTestimonials([]);
      } else {
        // For other errors, still show empty state but log the error
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
        consent_to_display: true,
      });
      setShowForm(false);
      // Refresh testimonials after a delay
      setTimeout(() => fetchTestimonials(), 2000);
    } catch (error) {
      alert('Failed to submit testimonial. Please try again.');
      console.error('Error submitting testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentTestimonial = testimonials[currentIndex];

  // Loading state
  if (loading && testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20 bg-gradient-to-br from-[#0B2545] to-[#1a365d] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-white/20 rounded w-96 mx-auto"></div>
            </div>
            <div className="h-96 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-[#0B2545] to-[#1a365d] text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </p>
          
          {/* Add testimonial button */}
          <motion.button
            onClick={() => setShowForm(true)}
            className="mt-6 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-2 px-6 rounded-full transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <MessageSquarePlus size={18} />
            Share Your Experience
          </motion.button>
        </motion.div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 mb-4">No testimonials yet. Be the first to share your experience!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#00C2A8] hover:bg-[#00A58E] text-white font-medium py-2 px-6 rounded-full transition-all duration-300"
            >
              Share Your Story
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between z-10 px-2">
              <button 
                onClick={prevTestimonial}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300 disabled:opacity-50"
                aria-label="Previous testimonial"
                disabled={testimonials.length <= 1}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300 disabled:opacity-50"
                aria-label="Next testimonial"
                disabled={testimonials.length <= 1}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div className="relative h-96 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {currentTestimonial && (
                  <motion.div
                    key={currentTestimonial.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction === 0 ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction === 0 ? -100 : 100 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                  >
                    <Quote className="h-12 w-12 text-[#00C2A8] mb-6 opacity-20" />
                    <p className="text-xl md:text-2xl font-medium mb-8 max-w-3xl">"{currentTestimonial.content}"</p>
                    
                    <div className="flex items-center justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${i < currentTestimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-500 text-gray-500'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-300">({currentTestimonial.rating}/5)</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      {currentTestimonial.avatar_url ? (
                        <img 
                          src={currentTestimonial.avatar_url} 
                          alt={currentTestimonial.client_name}
                          className="h-16 w-16 rounded-full border-2 border-white mb-3 object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full border-2 border-white mb-3 bg-gradient-to-br from-[#00C2A8] to-[#0066FF] flex items-center justify-center text-white font-bold">
                          {currentTestimonial.client_name.charAt(0)}
                        </div>
                      )}
                      <h4 className="font-bold text-lg">{currentTestimonial.client_name}</h4>
                      <p className="text-gray-300 text-sm">{currentTestimonial.client_role}</p>
                      {currentTestimonial.client_company && (
                        <p className="text-gray-400 text-sm">{currentTestimonial.client_company}</p>
                      )}
                      {currentTestimonial.service_title && (
                        <span className="mt-2 px-3 py-1 bg-white/10 rounded-full text-xs">
                          {currentTestimonial.service_title}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.slice(0, 6).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 0 : 1);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 bg-[#00C2A8]' 
                      : 'w-3 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
              {testimonials.length > 6 && (
                <span className="text-gray-400 text-sm ml-2">+{testimonials.length - 6}</span>
              )}
            </div>
          </div>
        )}

        {/* Testimonial Submission Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Share Your Experience
                  </h3>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client_role}
                      onChange={(e) => setFormData({...formData, client_role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Testimonial *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Tell us about your experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating *
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({...formData, rating})}
                          className="text-2xl focus:outline-none"
                        >
                          <Star
                            className={`${rating <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={formData.consent_to_display}
                      onChange={(e) => setFormData({...formData, consent_to_display: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-600 dark:text-gray-300">
                      I consent to have my testimonial displayed on your website
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white font-medium py-3 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Testimonial'}
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