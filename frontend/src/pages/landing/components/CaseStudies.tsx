import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

const CaseStudies = () => {
  const caseStudies = [
    {
      id: 1,
      title: 'E-commerce Brand Transformation',
      description: 'Complete digital makeover for a fashion retailer',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'Branding & Web',
      results: '320% increase in online sales',
      link: '#'
    },
    {
      id: 2,
      title: 'Educational Platform Development',
      description: 'Custom LMS for online education provider',
      image: 'https://images.unsplash.com/photo-1581092921461-39b2f2dbef9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'Web Development',
      results: '5,000+ active users in first month',
      link: '#'
    },
    {
      id: 3,
      title: 'Social Media Campaign',
      description: 'Viral marketing campaign for tech startup',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      category: 'Social Media',
      results: '2M+ impressions, 15K+ engagements',
      link: '#'
    }
  ];

  return (
    <section id="case-studies" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-wider text-[#00C2A8] uppercase">Case Studies</span>
          <h2 className="text-4xl font-bold mt-2 mb-4 dark:text-white">Our Success Stories</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              className="group bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative overflow-hidden h-60">
                <img 
                  src={study.image} 
                  alt={study.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-[#00C2A8] rounded-full mb-2">
                      {study.category}
                    </span>
                    <p className="text-white font-medium">{study.results}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 dark:text-white">{study.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{study.description}</p>
                <a 
                  href={study.link} 
                  className="inline-flex items-center text-[#0066FF] hover:text-[#0047AB] dark:text-[#00C2A8] dark:hover:text-[#00A58E] font-medium transition-colors group-hover:translate-x-1 duration-300"
                >
                  View Case Study <FaArrowRight className="ml-2 text-sm" />
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
          <a 
            href="#contact" 
            className="inline-block bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            View All Case Studies
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CaseStudies;
