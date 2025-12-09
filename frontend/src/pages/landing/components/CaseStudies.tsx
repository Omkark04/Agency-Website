// components/CaseStudies.tsx - DYNAMIC VERSION
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChartLine, FaClock, FaLightbulb } from 'react-icons/fa';
import { listCaseStudies } from '../../../api/portfolio';
import { listServices } from '../../../api/services';
import type { CaseStudy } from '../../../api/portfolio';

const CaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [caseRes, servicesRes] = await Promise.all([
        listCaseStudies({ is_published: true, is_featured: true, limit: 6 }),
        listServices({ is_active: true })
      ]);
      setCaseStudies(caseRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(caseStudies.map(cs => cs.category))];

  // Filter case studies
  const filteredCaseStudies = caseStudies.filter(cs => {
    if (selectedCategory !== 'all' && cs.category !== selectedCategory) return false;
    if (selectedService && cs.service_id !== selectedService) return false;
    return true;
  });

  // Loading skeleton
  if (loading) {
    return (
      <section id="case-studies" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-4"></div>
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
          <span className="text-sm font-semibold tracking-wider text-[#00C2A8] uppercase">
            Case Studies
          </span>
          <h2 className="text-4xl font-bold mt-2 mb-4 dark:text-white">
            Real Results, Real Impact
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] mx-auto rounded-full mb-8"></div>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
            
            <select
              value={selectedService || ''}
              onChange={(e) => setSelectedService(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]"
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {filteredCaseStudies.length === 0 ? (
          <div className="text-center py-12">
            <FaLightbulb className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No case studies found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {selectedCategory !== 'all' || selectedService 
                ? 'Try changing your filters'
                : 'Case studies coming soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCaseStudies.map((study, index) => (
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
                    src={study.featured_image} 
                    alt={study.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-[#00C2A8] rounded-full">
                      {study.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <FaChartLine className="h-4 w-4" />
                        <span className="font-medium">{study.results}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {study.metrics.slice(0, 2).map((metric: any, i: number) => (
                          <div key={i} className="text-sm">
                            <div className="font-bold">{metric.value}</div>
                            <div className="text-xs opacity-90">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {study.client_logo && (
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={study.client_logo} 
                        alt={study.client_name}
                        className="h-8 w-auto object-contain opacity-70"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {study.client_name}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2 dark:text-white">{study.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {study.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {study.technologies.slice(0, 3).map((tech: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {study.technologies.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{study.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FaClock className="h-4 w-4" />
                      <span>{study.duration}</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Navigate to case study detail page or open modal
                        console.log('View case study:', study.id);
                      }}
                      className="inline-flex items-center text-[#0066FF] hover:text-[#0047AB] dark:text-[#00C2A8] dark:hover:text-[#00A58E] font-medium transition-colors group-hover:translate-x-1 duration-300"
                    >
                      View Case Study <FaArrowRight className="ml-2 text-sm" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Want to see more of our work? Explore our complete portfolio.
          </p>
          <button
            onClick={() => {
              // Navigate to portfolio page or open full case studies
              window.location.href = '/portfolio';
            }}
            className="inline-block bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            View Complete Portfolio
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CaseStudies;