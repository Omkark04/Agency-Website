import { motion } from 'framer-motion';
import { FaSearch, FaClipboardList, FaCode, FaRocket } from 'react-icons/fa';
import { useProtectedNavigation } from '../../../hooks/useProtectedNavigation';
import { AuthModal } from './AuthModal';


const Process = () => {
  const { navigateTo, showAuthModal, setShowAuthModal } = useProtectedNavigation();
  const steps = [
    {
      id: 1,
      title: 'Discover',
      icon: <FaSearch className="text-3xl md:text-4xl text-white" />,
      description: 'We analyze your business needs and goals to create a customized strategy.',
      color: 'from-[#00C2A8] to-[#00A5C2]'
    },
    {
      id: 2,
      title: 'Plan',
      icon: <FaClipboardList className="text-3xl md:text-4xl text-white" />,
      description: 'Our team creates a detailed project roadmap with milestones and deliverables.',
      color: 'from-[#0066FF] to-[#0052CC]'
    },
    {
      id: 3,
      title: 'Build',
      icon: <FaCode className="text-3xl md:text-4xl text-white" />,
      description: 'We develop your solution with cutting-edge technology and best practices.',
      color: 'from-[#0B2545] to-[#1A365D]'
    },
    {
      id: 4,
      title: 'Deliver',
      icon: <FaRocket className="text-3xl md:text-4xl text-white" />,
      description: 'We launch your project and provide ongoing support for success.',
      color: 'from-[#8A2BE2] to-[#4B0082]'
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <motion.div 
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-xs md:text-sm font-semibold tracking-wide mb-3 md:mb-4">
            Our Process
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight leading-tight px-4">
            How We Work
          </h2>
          <p className="hidden md:block text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Our proven 4-step process ensures that every project is delivered on time, within budget, and exceeds your expectations.
          </p>
        </motion.div>

        {/* Desktop: Timeline Layout */}
        <div className="hidden md:block relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00C2A8] via-[#0066FF] to-[#8A2BE2] transform -translate-x-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`relative ${index % 2 === 0 ? 'lg:pr-20' : 'lg:pl-20 lg:mt-40'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Step number on timeline */}
                <div className="hidden lg:flex absolute top-0 left-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-900 items-center justify-center transform -translate-x-1/2 -translate-y-6 z-10">
                  <span className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent from-[#00C2A8] to-[#0066FF]">
                    0{step.id}
                  </span>
                </div>

                <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 group hover:shadow-xl transition-all duration-300`}>
                  {/* Corner accent */}
                  <div className={`absolute top-0 right-0 w-16 h-16 overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-10 transform rotate-45 origin-bottom-left`}></div>
                  </div>
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${step.color} shadow-md`}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 dark:text-white tracking-tight">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: Horizontal Scrollable Cards */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 pb-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="flex-shrink-0 w-[280px]"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 h-full">
                  {/* Step Number Badge */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent from-[#00C2A8] to-[#0066FF]">
                      0{step.id}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${step.color} shadow-md`}>
                    <div className="text-2xl text-white">
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold mb-3 dark:text-white tracking-tight leading-tight">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Bottom Gradient Border */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color}`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="mt-12 md:mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="hidden md:block text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Ready to transform your ideas into reality? Let's start your journey with our proven process.
          </p>
          <button 
            onClick={() => navigateTo('/client-dashboard/services')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-2.5 px-6 md:py-3 md:px-8 rounded-full text-sm md:text-base tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Your Project
            <FaRocket className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
      
      {/* Auth Modal for Protected Navigation */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode="login"
      />
    </section>
  );
};

export default Process;
