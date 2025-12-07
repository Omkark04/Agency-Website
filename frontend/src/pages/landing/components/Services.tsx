import { motion } from 'framer-motion';
import { FaPalette, FaLaptopCode, FaGraduationCap, FaChevronRight } from 'react-icons/fa';

export const Services = () => {
  const services = [
    {
      title: "Social Media Designing & Branding",
      icon: <FaPalette className="text-4xl text-[#00C2A8]" />,
      description: "Elevate your brand's online presence with our creative design solutions.",
      features: [
        "Graphics Designing",
        "Posters, Reels Editing, Banners",
        "Social Media Page Management",
        "Ad Creatives & Brand Identity"
      ],
      gradient: "from-[#00C2A8] to-[#00A5C2]"
    },
    {
      title: "Software & Web Development",
      icon: <FaLaptopCode className="text-4xl text-[#0066FF]" />,
      description: "Transform your ideas into powerful digital solutions with our development expertise.",
      features: [
        "Website Development",
        "Web & Mobile Applications",
        "AI & Automation Solutions",
        "Business Tools & CRM/ERP"
      ],
      gradient: "from-[#0066FF] to-[#0B2545]"
    },
    {
      title: "Educational & Academic Services",
      icon: <FaGraduationCap className="text-4xl text-[#0B2545] dark:text-[#00C2A8]" />,
      description: "Comprehensive academic support and educational content creation services.",
      features: [
        "Assignment Writing",
        "Project Development",
        "Report Writing",
        "Professional Presentations"
      ],
      gradient: "from-[#0B2545] to-[#00C2A8]"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-wider text-[#00C2A8] uppercase">Our Services</span>
          <h2 className="text-4xl font-bold mt-2 mb-4 dark:text-white">Comprehensive Solutions for Your Business</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.gradient}`}></div>
              
              <div className="p-8">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-3 dark:text-white">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{service.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="#contact" 
                  className="inline-flex items-center text-[#0066FF] hover:text-[#0047AB] dark:text-[#00C2A8] dark:hover:text-[#00A58E] font-medium transition-colors group-hover:translate-x-1 duration-300"
                >
                  Learn more <FaChevronRight className="ml-2 text-sm" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Don't see exactly what you're looking for? We offer custom solutions tailored to your needs.
          </p>
          <a 
            href="#contact" 
            className="inline-block bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Get a Custom Quote
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
