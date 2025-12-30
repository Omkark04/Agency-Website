import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [showSlogan, setShowSlogan] = useState(false);
  const [scaleOut, setScaleOut] = useState(false);

  useEffect(() => {
    // Timeline (4 seconds total):
    // 0s: Show logo
    // 0.5s: Show slogan
    // 2s: Hide slogan
    // 2.5s: Start scale out
    // 4s: Complete

    const sloganTimer = setTimeout(() => setShowSlogan(true), 500);
    const hideSloganTimer = setTimeout(() => setShowSlogan(false), 2000);
    const scaleOutTimer = setTimeout(() => setScaleOut(true), 2500);
    const completeTimer = setTimeout(() => onComplete(), 4000);

    return () => {
      clearTimeout(sloganTimer);
      clearTimeout(hideSloganTimer);
      clearTimeout(scaleOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
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
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 3px #F8FAFC;
            text-stroke: 3px #F8FAFC;
            font-weight: 900;
            letter-spacing: 0.05em;
            animation: smoothGlow 2s ease-in-out infinite;
            will-change: filter;
          }
          
          .intro-slogan {
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 1.5px #94A3B8;
            text-stroke: 1.5px #94A3B8;
            font-weight: 600;
            letter-spacing: 0.03em;
            filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.4));
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
                duration: scaleOut ? 1.5 : 0.8, 
                ease: [0.34, 1.56, 0.64, 1]
              },
              opacity: { 
                duration: scaleOut ? 1 : 0.8,
                ease: "easeOut"
              }
            }}
            className="intro-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-center"
            style={{
              lineHeight: 1.2
            }}
          >
            UdyogWorks
          </motion.h1>

          {/* Slogan */}
          <AnimatePresence>
            {showSlogan && !scaleOut && (
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
                Business Development & Marketing Agency
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
