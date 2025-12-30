import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
  title?: string;
  subtitle?: string | null;
  duration?: number;
}

export const IntroAnimation = ({ 
  onComplete, 
  title = "UdyogWorks", 
  subtitle = "Business Development & Marketing Agency",
  duration = 4000 
}: IntroAnimationProps) => {
  const [showSlogan, setShowSlogan] = useState(false);
  const [scaleOut, setScaleOut] = useState(false);

  useEffect(() => {
    // Calculate timeline based on duration
    const sloganDelay = duration * 0.125;      // 12.5%
    const hideSloganDelay = duration * 0.5;    // 50%
    const scaleOutDelay = duration * 0.625;    // 62.5%
    const completeDelay = duration;            // 100%

    const sloganTimer = setTimeout(() => setShowSlogan(true), sloganDelay);
    const hideSloganTimer = setTimeout(() => setShowSlogan(false), hideSloganDelay);
    const scaleOutTimer = setTimeout(() => setScaleOut(true), scaleOutDelay);
    const completeTimer = setTimeout(() => onComplete(), completeDelay);

    return () => {
      clearTimeout(sloganTimer);
      clearTimeout(hideSloganTimer);
      clearTimeout(scaleOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        }}
      >
        {/* Simplified CSS Animations */}
        <style>{`
          @keyframes smoothGlow {
            0%, 100% {
              filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.6))
                      drop-shadow(0 0 40px rgba(34, 211, 238, 0.3));
            }
            50% {
              filter: drop-shadow(0 0 30px rgba(34, 211, 238, 0.8))
                      drop-shadow(0 0 50px rgba(34, 211, 238, 0.4));
            }
          }
          
          .intro-text {
            color: #ffffff !important;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-shadow: 0 0 20px rgba(34, 211, 238, 0.8),
                         0 0 40px rgba(34, 211, 238, 0.5),
                         0 0 60px rgba(34, 211, 238, 0.3);
            animation: smoothGlow 2s ease-in-out infinite;
            will-change: filter, opacity;
          }
          
          .intro-slogan {
            color: #94A3B8 !important;
            font-weight: 600;
            letter-spacing: 0.03em;
            text-shadow: 0 0 10px rgba(34, 211, 238, 0.5),
                         0 0 20px rgba(34, 211, 238, 0.3);
          }
        `}</style>

        {/* Content Container */}
        <div className="flex flex-col items-center justify-center px-4 w-full max-w-7xl">
          {/* Main Logo Text */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: scaleOut ? 4 : 1, 
              opacity: scaleOut ? 0 : 1 
            }}
            transition={{
              scale: { 
                duration: scaleOut ? (duration * 0.375 / 1000) : (duration * 0.2 / 1000), 
                ease: [0.34, 1.56, 0.64, 1]
              },
              opacity: { 
                duration: scaleOut ? (duration * 0.25 / 1000) : (duration * 0.2 / 1000),
                ease: "easeOut"
              }
            }}
            className="intro-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-center"
            style={{
              lineHeight: 1.2
            }}
          >
            {title}
          </motion.h1>

          {/* Slogan */}
          <AnimatePresence>
            {showSlogan && !scaleOut && subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeOut"
                }}
                className="intro-slogan text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center mt-4 md:mt-6"
              >
                {subtitle}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Simplified Decorative Elements */}
        <div
          className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-32 h-32 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroAnimation;
