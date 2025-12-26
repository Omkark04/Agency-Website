import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Image as ImageIcon, Building2, Instagram, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchHeroImages } from '../../../api/media';
import type { MediaItem } from '../../../api/media';
import { getTestimonialStats } from '../../../api/testinomials';
import { listDepartments, type Department } from '../../../api/departments';
import { useProtectedNavigation } from '../../../hooks/useProtectedNavigation';
import AuthModal from './AuthModal';




export const Hero = ({ onGetStartedClick }: { onGetStartedClick?: () => void }) => {
  const { navigateTo, showAuthModal, setShowAuthModal } = useProtectedNavigation();
  const [heroImages, setHeroImages] = useState<MediaItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState({
    clients: 100,
    projects: 250,
    satisfaction: 98
  });


  // Fetch hero images and stats on component mount
  useEffect(() => {
    loadHeroImages();
    loadStats();
    loadDepartments();
  }, []);


  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % heroImages.length
        );
      }, 5000);
     
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);


  const loadHeroImages = async () => {
    try {
      setIsLoading(true);
      const images = await fetchHeroImages();
      setHeroImages(images);
    } catch (error) {
      console.error('Failed to load hero images:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const loadStats = async () => {
    try {
      console.log('Hero: Fetching stats...');
      const response = await getTestimonialStats();
      console.log('Hero: Stats response:', response.data);
      setStats({
        clients: response.data.total,
        projects: response.data.total * 2, // Approximate: 2 projects per client
        satisfaction: Math.round((response.data.average_rating / 5) * 100)
      });
      console.log('Hero: Stats updated');
    } catch (error) {
      console.error('Hero: Failed to load stats:', error);
    }
  };


  const loadDepartments = async () => {
    try {
      const response = await listDepartments({ is_active: true });
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };


  const handlePrevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };


  const handleNextImage = () => {
    setCurrentImageIndex(prev =>
      (prev + 1) % heroImages.length
    );
  };


  return (
    <>
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
     
      <section id='home' className="relative overflow-hidden bg-gradient-to-br from-[#0B2545] to-[#1a365d] text-white pt-8 md:pt-12 pb-20 md:pb-32">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="z-10 space-y-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                We Build, Create & Grow Your Business Digitally
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Business development agency powering growth through design, technology & education.
              </p>
             
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => navigateTo('/client-dashboard/services')}
                  className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                  View Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>


            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#00C2A8]">{stats.clients}+</div>
                <div className="text-sm text-gray-300">Happy Clients</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#00C2A8]">{stats.projects}+</div>
                <div className="text-sm text-gray-300">Projects Completed</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#00C2A8]">{stats.satisfaction}%</div>
                <div className="text-sm text-gray-300">Satisfaction Rate</div>
              </motion.div>
            </div>


            {/* Departments List - Enhanced with Creative Animations */}
            {departments.length > 0 && (
              <motion.div
                className="mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.h3
                  className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <Building2 className="h-5 w-5 text-[#00C2A8]" />
                  </motion.div>
                  Our Departments
                </motion.h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {departments.map((dept, index) => (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, y: 30, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.7 + index * 0.1,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      className="relative group cursor-pointer"
                    >
                      {/* Animated gradient background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-[#00C2A8]/20 via-[#0066FF]/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                     
                      {/* Card content */}
                      <motion.div
                        className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 overflow-hidden"
                        whileHover={{
                          borderColor: "rgba(0, 194, 168, 0.5)",
                          boxShadow: "0 0 20px rgba(0, 194, 168, 0.3)"
                        }}
                      >
                        {/* Floating particles effect on hover */}
                        <motion.div
                          className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                       
                        <div className="flex items-center gap-3 relative z-10">
                          {dept.logo ? (
                            <motion.img
                              src={dept.logo}
                              alt={dept.title}
                              className="w-10 h-10 object-contain rounded-lg"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            />
                          ) : (
                            <motion.div
                              className="w-10 h-10 bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-lg flex items-center justify-center shadow-lg"
                              whileHover={{
                                rotate: [0, -10, 10, 0],
                                scale: 1.1
                              }}
                              transition={{ duration: 0.4 }}
                            >
                              <Building2 className="h-5 w-5 text-white" />
                            </motion.div>
                          )}
                          <div className="flex-1 min-w-0">
                            <motion.p
                              className="text-sm font-semibold text-white truncate"
                              initial={{ opacity: 0.9 }}
                              whileHover={{
                                opacity: 1,
                                x: 3,
                                color: "#00C2A8"
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              {dept.title}
                            </motion.p>
                            <motion.div
                              className="h-0.5 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] mt-1"
                              initial={{ scaleX: 0 }}
                              whileHover={{ scaleX: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{ transformOrigin: "left" }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            </motion.div>


            {/* Right Content - Dynamic Hero Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-2xl p-1 shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                  {isLoading ? (
                    // Loading skeleton
                    <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2A8] mx-auto mb-4"></div>
                        <span className="text-gray-400 dark:text-gray-600">Loading images...</span>
                      </div>
                    </div>
                  ) : heroImages.length > 0 ? (
                    // Image Gallery
                    <div className="relative h-80 overflow-hidden group">
                      {/* Main Image */}
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        src={heroImages[currentImageIndex]?.url}
                        alt={heroImages[currentImageIndex]?.caption || 'Hero Business Image'}
                        className="w-full h-full object-cover"
                      />
                     
                      {/* Image Navigation Arrows */}
                      {heroImages.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <ArrowRight className="h-5 w-5 rotate-180" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </>
                      )}
                     
                      {/* Image Counter */}
                      {heroImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {heroImages.length}
                        </div>
                      )}
                     
                      {/* Image Caption */}
                      {heroImages[currentImageIndex]?.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-white text-sm font-medium truncate">
                            {heroImages[currentImageIndex].caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback when no images are found
                    <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6">
                      <ImageIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                      <span className="text-gray-400 dark:text-gray-600 text-center">
                        No hero images found. Upload images with 'hero' in caption.
                      </span>
                    </div>
                  )}
                </div>
              </div>
             
              {/* Image Indicators (Dots) */}
              {heroImages.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'w-8 bg-gradient-to-r from-[#00C2A8] to-[#0066FF]'
                          : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
             
              {/* Floating elements */}
              <motion.div
                className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="bg-[#E1306C]/10 p-2 rounded-lg">
                  <Instagram className="h-8 w-8 text-[#E1306C]" />
                </div>
              </motion.div>
             
              <motion.div
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, delay: 1, repeat: Infinity }}
              >
                <div className="bg-[#1877F2]/10 p-2 rounded-lg">
                  <Facebook className="h-8 w-8 text-[#1877F2]" />
                </div>
              </motion.div>
            </div>
            </motion.div>
          </div>


          {/* Background elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00C2A8]/10 to-transparent -z-0" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0B2545] to-transparent -z-0" />
         
          {/* Animated background dots */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * 20 - 10, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};


export default Hero;
