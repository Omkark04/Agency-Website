import { motion } from 'framer-motion';
import { FaSearch, FaClipboardList, FaCode, FaRocket } from 'react-icons/fa';
import { useProtectedNavigation } from '../../../hooks/useProtectedNavigation';
import { AuthModal } from './AuthModal';
import { SectionHeader } from '../../../components/shared/SectionHeader';


const Process = () => {
  const { navigateTo, showAuthModal, setShowAuthModal } = useProtectedNavigation();
  const steps = [
    {
      id: 1,
      title: 'Discover',
      icon: <FaSearch className="text-3xl md:text-4xl text-white" />,
      description: 'We analyze your business needs and goals to create a customized strategy.',
      color: 'from-cyan-400 to-blue-500',
      shadow: 'shadow-cyan-500/50'
    },
    {
      id: 2,
      title: 'Plan',
      icon: <FaClipboardList className="text-3xl md:text-4xl text-white" />,
      description: 'Our team creates a detailed project roadmap with milestones and deliverables.',
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/50'
    },
    {
      id: 3,
      title: 'Build',
      icon: <FaCode className="text-3xl md:text-4xl text-white" />,
      description: 'We develop your solution with cutting-edge technology and best practices.',
      color: 'from-indigo-600 to-violet-600',
      shadow: 'shadow-indigo-500/50'
    },
    {
      id: 4,
      title: 'Deliver',
      icon: <FaRocket className="text-3xl md:text-4xl text-white" />,
      description: 'We launch your project and provide ongoing support for success.',
      color: 'from-violet-600 to-fuchsia-600',
      shadow: 'shadow-violet-500/50'
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <SectionHeader
          caption="Success roadmap"
          title="How"
          highlightedTitle="We Work"
          description="Our proven 4-step process ensures that every project is delivered on time, within budget, and exceeds your expectations."
        />

        {/* Desktop: Horizontal Progressive Layout */}
        <div className="hidden md:block relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-lg bg-white text-gray-900 border border-gray-100 hover:bg-[#0A1F44] hover:text-white transition-all duration-500"
              >
                {/* Header with Title and Icon Box */}
                <div className="p-8 pb-0 flex justify-between items-start">
                  <h3 className="text-2xl font-bold leading-tight max-w-[70%] group-hover:text-white transition-colors duration-500">
                    {step.title}
                  </h3>
                  
                  {/* Icon Box in Top Right Corner area */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.color} ${step.shadow} shadow-lg transition-all duration-500 group-hover:scale-110`}>
                    <div className="text-2xl text-white">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="px-8 mt-6">
                  <div className="w-full h-[1px] bg-gray-200 group-hover:bg-[#00BCD4]/30 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="p-8 pt-6 flex-grow">
                  <p className="text-base leading-relaxed text-gray-600 group-hover:text-gray-300 transition-colors duration-500">
                    {step.description}
                  </p>
                </div>

                {/* Floating Number */}
                <div className="absolute bottom-6 right-8 text-4xl font-black opacity-10 text-gray-200 group-hover:text-[#00BCD4] group-hover:opacity-20 transition-all duration-500">
                  0{step.id}
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
                    <span className="text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent from-[#015bad] to-[#0A1F44]">
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#015bad] to-[#0A1F44] hover:opacity-90 text-white font-semibold py-2.5 px-6 md:py-3 md:px-8 rounded-full text-sm md:text-base tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
