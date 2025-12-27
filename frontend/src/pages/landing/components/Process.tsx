import { motion } from 'framer-motion';
import { FaSearch, FaClipboardList, FaCode, FaRocket } from 'react-icons/fa';


const Process = () => {
  const steps = [
    {
      id: 1,
      title: 'Discover',
      icon: <FaSearch className="text-3xl text-white" />,
      description: 'We analyze your business needs and goals to create a customized strategy.',
      color: 'from-[#00C2A8] to-[#00A5C2]'
    },
    {
      id: 2,
      title: 'Plan',
      icon: <FaClipboardList className="text-3xl text-white" />,
      description: 'Our team creates a detailed project roadmap with milestones and deliverables.',
      color: 'from-[#0066FF] to-[#0052CC]'
    },
    {
      id: 3,
      title: 'Build',
      icon: <FaCode className="text-3xl text-white" />,
      description: 'We develop your solution with cutting-edge technology and best practices.',
      color: 'from-[#0B2545] to-[#1A365D]'
    },
    {
      id: 4,
      title: 'Deliver',
      icon: <FaRocket className="text-3xl text-white" />,
      description: 'We launch your project and provide ongoing support for success.',
      color: 'from-[#8A2BE2] to-[#4B0082]'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-wider text-[#00C2A8] uppercase">Our Process</span>
          <h2 className="text-4xl font-bold mt-2 mb-4 dark:text-white">How We Work</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] mx-auto rounded-full"></div>
        </motion.div>

        <div className="relative">
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
                  
                  <h3 className="text-xl font-bold mb-3 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                  
                  {/* Connector arrow for mobile */}
                  <div className="lg:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-90 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Our proven 4-step process ensures that every project is delivered on time, within budget, and exceeds your expectations.
          </p>
          <button 
            onClick={() => window.open('/client-dashboard/services', '_self')}
            className="inline-block bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Start Your Project
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Process;
