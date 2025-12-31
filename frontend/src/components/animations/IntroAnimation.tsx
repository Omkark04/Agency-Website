import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
  title?: string;
  subtitle?: string | null;
  duration?: number;
  page?: 'landing' | 'pricing-plans' | string;
}

export const IntroAnimation = ({ 
  onComplete, 
  title = "UdyogWorks", 
  subtitle = "Business Development & Marketing Agency",
  duration,
  page = 'landing'
}: IntroAnimationProps) => {
  // Determine duration based on page if not explicitly provided
  const animationDuration = duration ?? (page === 'pricing-plans' ? 3000 : 4000);
  
  const [showSlogan, setShowSlogan] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [scaleOut, setScaleOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  
  // Detect mobile and low-end devices
  const isMobile = useRef(() => {
    if (typeof navigator === 'undefined') return true;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }).current();

  const isLowEndDevice = useRef(() => {
    if (typeof navigator === 'undefined') return true;
    const cores = navigator.hardwareConcurrency || 2;
    return (isMobile && cores <= 4) || (!isMobile && cores <= 2);
  }).current();

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }

    let hasShownParticles = false;
    let hasShownSlogan = false;
    let hasHiddenSlogan = false;

    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed >= animationDuration) {
        cleanup();
        setScaleOut(true);
        setTimeout(() => {
          setIsVisible(false);
          onComplete();
        }, 600);
        return;
      }
      
      if (elapsed >= 400 && !hasShownParticles) {
        hasShownParticles = true;
        setShowParticles(true);
      }
      if (elapsed >= 800 && !hasShownSlogan) {
        hasShownSlogan = true;
        setShowSlogan(true);
      }
      if (elapsed >= animationDuration - 800 && !hasHiddenSlogan) {
        hasHiddenSlogan = true;
        setShowSlogan(false);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    return cleanup;
  }, [onComplete, animationDuration, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  // Optimize particle count based on device
  const particleCount = isMobile ? 8 : isLowEndDevice ? 0 : 15;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: isMobile ? 1.5 + Math.random() * 2 : 2 + Math.random() * 3
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scaleOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: scaleOut ? 0.6 : 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            willChange: 'opacity',
          }}
        >
          <style jsx>{`

            .intro-title {
              background: linear-gradient(
                135deg,
                #ffffff 0%,
                #60a5fa 50%,
                #3b82f6 100%
              );
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 800;
              letter-spacing: -0.03em;
              filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));
              line-height: 1.2;
              padding-bottom: 0.1em;
            }
            
            .intro-subtitle {
              color: #cbd5e1;
              font-weight: 500;
              letter-spacing: 0.05em;
              text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
            }
            
            .accent-line {
              background: linear-gradient(90deg, transparent, #3b82f6, transparent);
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
            }
          `}</style>

          {/* Animated Grid Background */}
          {!isLowEndDevice && !scaleOut && (
            <div className="absolute inset-0 opacity-20">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }}
              />
            </div>
          )}

          {/* Floating Particles - Only show briefly, no infinite repeat */}
          {showParticles && particleCount > 0 && !scaleOut && particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0.5]
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeInOut"
              }}
              className="absolute rounded-full bg-blue-400"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                filter: isMobile ? 'none' : 'blur(1px)'
              }}
            />
          ))}

          {/* Gradient Orbs - Static, no animation */}
          {!isLowEndDevice && !scaleOut && (
            <>
              <div
                className={`absolute top-1/4 left-1/3 rounded-full ${isMobile ? 'w-48 h-48' : 'w-96 h-96'}`}
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                  filter: isMobile ? 'blur(40px)' : 'blur(60px)',
                  opacity: 0.4
                }}
              />
              <div
                className={`absolute bottom-1/3 right-1/3 rounded-full ${isMobile ? 'w-48 h-48' : 'w-96 h-96'}`}
                style={{
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                  filter: isMobile ? 'blur(40px)' : 'blur(60px)',
                  opacity: 0.3
                }}
              />
            </>
          )}

          {/* Main Content */}
          <div className="relative w-full max-w-6xl px-6 md:px-12">
            {/* Decorative Top Line */}
            {!scaleOut && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mx-auto mb-6 md:mb-8 h-px w-24 accent-line"
                style={{ originX: 0.5 }}
              />
            )}

            {/* Title */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ 
                scale: scaleOut ? (isLowEndDevice ? 1.3 : 2.5) : 1,
                opacity: scaleOut ? 0 : 1,
                y: scaleOut ? -50 : 0
              }}
              transition={{
                scale: { 
                  duration: scaleOut ? 0.6 : 1,
                  ease: scaleOut ? [0.43, 0.13, 0.23, 0.96] : [0.16, 1, 0.3, 1]
                },
                opacity: { duration: scaleOut ? 0.5 : 0.8 },
                y: { duration: scaleOut ? 0.6 : 1 }
              }}
              className="relative z-10"
            >
              <h1 className={`intro-title text-center font-black pb-2 ${
                isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl'
              }`}>
                {title.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: isMobile ? 20 : 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: isMobile ? 0.3 : 0.5,
                      delay: 0.2 + i * (isMobile ? 0.03 : 0.05),
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
            </motion.div>

            {/* Subtitle */}
            <AnimatePresence>
              {showSlogan && !scaleOut && subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative z-10 mt-8 md:mt-10"
                >
                  <p className={`intro-subtitle text-center max-w-3xl mx-auto uppercase tracking-widest ${
                    isMobile ? 'text-sm sm:text-base' : 'text-base sm:text-lg md:text-xl lg:text-2xl'
                  }`}>
                    {subtitle}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Decorative Bottom Line */}
            {!scaleOut && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto mt-12 md:mt-16 h-px w-24 accent-line"
                style={{ originX: 0.5 }}
              />
            )}

            {/* Progress Indicator */}
            {!isLowEndDevice && !scaleOut && !isMobile && (
              <motion.div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      backgroundColor: ['#3b82f6', '#60a5fa', '#3b82f6']
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: 2,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Corner Accents */}
          {!isLowEndDevice && !scaleOut && !isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-blue-400"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-blue-400"
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;