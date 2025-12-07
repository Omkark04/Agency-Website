import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
    content: 'UdyogWorks transformed our online presence completely. Their team delivered exceptional results with our website redesign and social media strategy. Highly recommended!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Marketing Director, GrowthLabs',
    content: 'The level of professionalism and creativity from UdyogWorks is unmatched. They understood our vision and brought it to life beyond our expectations.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Founder, CreativeMinds',
    content: 'Working with UdyogWorks has been a game-changer for our business. Their attention to detail and strategic approach delivered outstanding results.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Product Manager, NextGen Tech',
    content: 'The team at UdyogWorks is incredibly talented and professional. They delivered our project on time and within budget. Will definitely work with them again!',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 5
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 0: next, 1: prev

  const nextTestimonial = () => {
    setDirection(0);
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

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
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between z-10 px-2">
            <button 
              onClick={prevTestimonial}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="relative h-96 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
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
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < currentTestimonial.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <div className="flex flex-col items-center">
                  <img 
                    src={currentTestimonial.avatar} 
                    alt={currentTestimonial.name}
                    className="h-16 w-16 rounded-full border-2 border-white mb-3"
                  />
                  <h4 className="font-bold text-lg">{currentTestimonial.name}</h4>
                  <p className="text-gray-300 text-sm">{currentTestimonial.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
