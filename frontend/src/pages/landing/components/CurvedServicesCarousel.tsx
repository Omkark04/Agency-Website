import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { listServices, type Service } from '../../../api/services';
import { Palette, Code, GraduationCap, Megaphone, TrendingUp, Smartphone } from 'lucide-react';

const iconMap: Record<string, any> = {
  'palette': Palette,
  'laptop-code': Code,
  'code': Code,
  'graduation-cap': GraduationCap,
  'megaphone': Megaphone,
  'chart-line': TrendingUp,
  'mobile': Smartphone,
  'brush': Palette,
};

export const CurvedServicesCarousel = () => {
  const [services, setServices] = useState<Service[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    loadServices();
    
    // Auto-slide
    const interval = setInterval(() => {
      handleAutoScroll();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [services.length]);

  const loadServices = async () => {
    try {
      const response = await listServices({ is_active: true });
      setServices(response.data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleAutoScroll = () => {
    if (scrollRef.current) {
      const cardWidth = 280; // Card width + gap
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      const currentScroll = scrollRef.current.scrollLeft;
      
      if (currentScroll >= maxScroll - 10) {
        // Reset to start
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }
  };

  const handleServiceClick = () => {
    if (user) {
      navigate('/client-dashboard/services');
    } else {
      navigate('/pricing-plans');
    }
  };

  const getServiceIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Palette;
    return Icon;
  };

  if (services.length === 0) return null;

  return (
    <div className="mt-8 mb-6">
      <h3 className="text-lg font-semibold text-white/90 mb-4 px-4 flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          ✨
        </motion.div>
        Our Services
      </h3>
      
      <div className="curved-perspective">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-6 curved-scroll snap-x snap-mandatory"
        >
          {services.map((service, index) => {
            const Icon = getServiceIcon(service.icon_name);
            
            return (
              <motion.div
                key={service.id}
                onClick={handleServiceClick}
                className="flex-shrink-0 w-[260px] snap-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated gradient border wrapper */}
                <div className="relative">
                  {/* Animated rainbow gradient border */}
                  <div className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-border" 
                       style={{
                         background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #00d2d3, #ff6b6b)',
                         backgroundSize: '400% 400%',
                         filter: 'blur(8px)',
                       }}
                  />
                  
                  {/* Glassmorphism card */}
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-[200px] overflow-hidden cursor-pointer shadow-xl">
                    {/* Background gradient overlay */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${service.gradient_colors} opacity-20`}
                    />
                    
                    {/* Decorative glass reflection */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      {/* Service icon/logo */}
                      <div>
                        {service.logo ? (
                          <motion.img
                            src={service.logo}
                            alt={service.title}
                            className="w-16 h-16 object-contain mb-3 drop-shadow-lg"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          />
                        ) : (
                          <motion.div
                            className={`w-16 h-16 bg-gradient-to-br ${service.gradient_colors} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                        )}
                        
                        {/* Service title */}
                        <h4 className="text-white font-bold text-lg line-clamp-2 drop-shadow-md">
                          {service.title}
                        </h4>
                      </div>
                      
                      {/* Service description */}
                      <p className="text-white/80 text-sm line-clamp-2 mt-2">
                        {service.short_description}
                      </p>
                      
                      {/* Hover indicator */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        /* Curved perspective container */
        .curved-perspective {
          perspective: 1200px;
          perspective-origin: center;
        }
        
        /* Curved scroll container */
        .curved-scroll {
          transform: rotateX(8deg);
          transform-style: preserve-3d;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Hide scrollbar */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Animated gradient border */
        @keyframes gradient-border {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-border {
          animation: gradient-border 8s ease infinite;
        }
        
        /* Snap scroll */
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        .snap-center {
          scroll-snap-align: center;
        }
      `}</style>
    </div>
  );
};

export default CurvedServicesCarousel;
