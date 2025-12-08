import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export const Hero = ({ onGetStartedClick }: HeroProps) => {
  const stats = [
    { value: '100+', label: 'Happy Clients' },
    { value: '250+', label: 'Projects Completed' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0B2545] to-[#1a365d] text-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              We Build, Create & Grow Your Business Digitally
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Business development agency powering growth through design, technology & education.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={onGetStartedClick}
                className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => {
                  const servicesSection = document.getElementById('services');
                  if (servicesSection) {
                    servicesSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-full border border-white/20 transition-all duration-300"
              >
                View Services
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-[#00C2A8]">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-2xl p-1">
                <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                  <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-600">Business Growth Illustration</span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="bg-[#00C2A8]/10 p-2 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-[#00C2A8]" />
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, delay: 1, repeat: Infinity }}
              >
                <div className="bg-[#0066FF]/10 p-2 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-[#0066FF]" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00C2A8]/10 to-transparent -z-0" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0B2545] to-transparent -z-0" />
    </section>
  );
};

export default Hero;
