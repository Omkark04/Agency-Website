import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Image as ImageIcon, Building2, Instagram, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchHeroImages, fetchHeroBackground, fetchMobileHeroBackground } from '../../../api/media';
import type { MediaItem } from '../../../api/media';
import { getTestimonialStats } from '../../../api/testinomials';
import { listDepartments, type Department } from '../../../api/departments';
import { listServices, type Service } from '../../../api/services';
import { useProtectedNavigation } from '../../../hooks/useProtectedNavigation';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

export const Hero = ({ onGetStartedClick }: { onGetStartedClick?: () => void }) => {
  const { navigateTo, showAuthModal, setShowAuthModal } = useProtectedNavigation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [heroImages, setHeroImages] = useState<MediaItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [heroBackground, setHeroBackground] = useState<MediaItem | null>(null);
  const [mobileHeroBackground, setMobileHeroBackground] = useState<MediaItem | null>(null);
  const [backgroundLoading, setBackgroundLoading] = useState(true);
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
    loadServices();
    loadHeroBackground();
    loadMobileHeroBackground();
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
      const response = await getTestimonialStats();
      setStats({
        clients: response.data.total,
        projects: response.data.total * 2, // Approximate: 2 projects per client
        satisfaction: Math.round((response.data.average_rating / 5) * 100)
      });
    } catch (error) {
      console.error('Hero: Failed to load stats:', error);
    }
  };


  const loadDepartments = async () => {
    try {
      const response = await listDepartments({ is_active: true });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await listServices({ is_active: true });
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadHeroBackground = async () => {
    try {
      setBackgroundLoading(true);
      const background = await fetchHeroBackground();
      setHeroBackground(background);
    } catch (error) {
      console.error('Failed to load hero background:', error);
    } finally {
      setBackgroundLoading(false);
    }
  };

  const loadMobileHeroBackground = async () => {
    try {
      const background = await fetchMobileHeroBackground();
      setMobileHeroBackground(background);
    } catch (error) {
      console.error('Failed to load mobile hero background:', error);
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

      <section id='home' className="relative overflow-x-hidden text-white pt-28 md:pt-36 pb-6 md:pb-8">
        {/* Mobile Background - Show only on mobile */}
        <div className="block md:hidden">
          {mobileHeroBackground ? (
            mobileHeroBackground.media_type === 'video' ? (
              <>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                >
                  <source src={mobileHeroBackground.url} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 z-[1]" />
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${mobileHeroBackground.url})` }}
                />
                <div className="absolute inset-0 bg-black/40 z-[1]" />
              </>
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F44] to-[#0097A7] z-0" />
          )}
        </div>

        {/* Desktop Background - Show only on desktop */}
        <div className="hidden md:block">
          {!backgroundLoading && heroBackground ? (
            heroBackground.media_type === 'video' ? (
              <>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                >
                  <source src={heroBackground.url} type="video/mp4" />
                </video>
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 z-[1]" />
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${heroBackground.url})` }}
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 z-[1]" />
              </>
            )
          ) : (
            // Fallback gradient background
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F44] to-[#015bad] z-0" />
          )}
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 overflow-x-hidden md:overflow-visible">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start overflow-x-hidden md:overflow-visible">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="z-10 space-y-6 md:space-y-8 w-full max-w-full overflow-x-hidden md:overflow-visible"
            >

              {/* Top 3 Departments - Desktop Only */}
              {departments.length > 0 && (
                <div className="hidden md:flex flex-row gap-4 mt-8 w-full">
                  {departments.slice(0, 3).map((dept) => (
                    <motion.div
                      key={dept.id}
                      onClick={() => navigate(`/departments/${dept.slug}`)}
                      className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 cursor-pointer hover:bg-white/20 hover:border-white/40 hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-3 shadow-xl"
                    >
                      <div className="w-full flex justify-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center overflow-hidden p-2">
                          {dept.logo ? (
                            <img src={dept.logo} alt="" className="w-full h-full object-contain drop-shadow-md" />
                          ) : (
                            <Building2 className="h-6 w-6 text-white drop-shadow-md" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-2 leading-tight tracking-wide">{dept.title}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Services Carousel - Mobile Only */}
              {services.length > 0 && (
                <div className="block md:hidden mt-6 w-full -mx-4">
                  <style>{`
                    @keyframes marquee-services {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .animate-marquee-services {
                      animation: marquee-services 25s linear infinite;
                    }
                    .animate-marquee-services:hover {
                      animation-play-state: paused;
                    }
                  `}</style>

                  <motion.h3
                    className="text-base font-semibold text-white/90 mb-3 px-4 flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
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
                      <CheckCircle className="h-5 w-5 text-[#F5B041]" />
                    </motion.div>
                    Our Services
                  </motion.h3>

                  <div className="relative overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {/* Gradient edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0A1F44] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0A1F44] to-transparent z-10 pointer-events-none" />

                    <div className="flex gap-4 w-max animate-marquee-services">
                      {[...services, ...services].map((service, index) => (
                        <motion.div
                          key={`${service.id}-mobile-${index}`}
                          onClick={() => isAuthenticated ? navigate('/client-dashboard/services') : navigate('/pricing-plans')}
                          className="flex-shrink-0 w-[140px] bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 cursor-pointer hover:bg-white/15 transition-all"
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="flex flex-col items-center gap-2 text-center h-full justify-center">
                            <span className="text-sm font-medium text-white line-clamp-2">
                              {service.title}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Departments List - Mobile Only */}
              {departments.length > 0 && (
                <div className="block md:hidden mt-6 -mx-4">
                  <style>{`
                    @keyframes marquee-departments {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .animate-marquee-departments {
                      animation: marquee-departments 20s linear infinite;
                    }
                    .animate-marquee-departments:hover {
                      animation-play-state: paused;
                    }
                  `}</style>

                  <motion.h3
                    className="text-base font-semibold text-white/90 mb-3 px-4 flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
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
                      <Building2 className="h-5 w-5 text-[#F5B041]" />
                    </motion.div>
                    Our Departments
                  </motion.h3>

                  <div className="relative overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {/* Gradient edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0A1F44] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0A1F44] to-transparent z-10 pointer-events-none" />

                    <div className="flex gap-4 w-max animate-marquee-departments">
                      {[...departments, ...departments].map((dept, index) => (
                        <motion.div
                          key={`${dept.id}-mobile-${index}`}
                          onClick={() => navigate(`/departments/${dept.slug}`)}
                          className="flex-shrink-0 w-[200px] bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/15 transition-all"
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#015bad] to-[#0A1F44] rounded-lg flex items-center justify-center overflow-hidden">
                              {dept.logo ? (
                                <img src={dept.logo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <p className="text-sm font-semibold text-white line-clamp-2">{dept.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats - Mobile Only (below departments) */}
              <div className="block md:hidden mt-6 w-full max-w-full overflow-x-hidden">
                <div className="grid grid-cols-3 gap-2 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2"
                  >
                    <div className="text-xl font-bold text-[#00BCD4]">{stats.clients}+</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">Happy Clients</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2"
                  >
                    <div className="text-xl font-bold text-[#00BCD4]">{stats.projects}+</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">Projects Completed</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2"
                  >
                    <div className="text-xl font-bold text-[#00BCD4]">{stats.satisfaction}%</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">Satisfaction Rate</div>
                  </motion.div>
                </div>
              </div>

            </motion.div>

            {/* Right Content - Dynamic Hero Image Gallery - Desktop Only */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block relative"
            >
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-[#015bad] to-[#0A1F44] rounded-2xl p-1 shadow-2xl">
                  <div className="bg-white rounded-xl overflow-hidden">
                    {isLoading ? (
                      // Loading skeleton
                      <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#015bad] mx-auto mb-4"></div>
                          <span className="text-gray-400">Loading images...</span>
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
                      <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6">
                        <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <span className="text-gray-400 text-center">
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
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                          ? 'w-8 bg-gradient-to-r from-[#015bad] to-[#0A1F44]'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                          }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-6 -left-6 bg-white p-3 rounded-xl shadow-lg z-20"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="bg-[#E1306C]/10 p-2 rounded-lg">
                    <Instagram className="h-8 w-8 text-[#E1306C]" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -right-6 bg-white p-3 rounded-xl shadow-lg z-20"
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

          {/* Stats - Desktop Only */}
          <div className="hidden md:grid grid-cols-3 gap-8 mt-16 mb-8 max-w-4xl mx-auto border-t border-white/10 pt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#00BCD4]">{stats.clients}+</div>
              <div className="text-sm text-gray-300 mt-2">Happy Clients</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#00BCD4]">{stats.projects}+</div>
              <div className="text-sm text-gray-300 mt-2">Projects Completed</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#00BCD4]">{stats.satisfaction}%</div>
              <div className="text-sm text-gray-300 mt-2">Satisfaction Rate</div>
            </motion.div>
          </div>

          {/* Animated background dots */}
          <div className="absolute inset-0 overflow-hidden z-[2]">
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
