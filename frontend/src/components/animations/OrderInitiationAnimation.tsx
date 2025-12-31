import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface OrderInitiationAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const OrderInitiationAnimation = ({ isVisible, onComplete }: OrderInitiationAnimationProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Detect low-end device
  const isLowEndDevice = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={onComplete}
          style={{ backdropFilter: isLowEndDevice ? 'none' : 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: prefersReducedMotion ? "easeOut" : [0.34, 1.26, 0.64, 1]
            }}
            className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Checkmark Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.3,
                ease: "easeOut"
              }}
              className="relative mx-auto w-24 h-24 md:w-32 md:h-32 mb-6"
            >
              {/* Circle background */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
              />
              
              {/* Checkmark icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Pulse ring effect - limited to 2 iterations instead of infinite */}
              {!isLowEndDevice && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.8,
                    repeat: 1,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full bg-green-400"
                />
              )}
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-center"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Order Initiated Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                We'll get back to you shortly with more details.
              </p>
            </motion.div>

            {/* Decorative elements - only on higher-end devices */}
            {!isLowEndDevice && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-400"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-emerald-400"
                />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderInitiationAnimation;

