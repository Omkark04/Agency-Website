import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  ExternalLink, 
  X, 
  ChevronRight,
  Star,
  Calendar,
  User,
  Briefcase,
  PlayCircle
} from 'lucide-react';
import { fetchPortfolioProjects } from '../../../api/portfolio';
import type { PortfolioProject } from '../../../api/portfolio';

const PortfolioSection = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, activeFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchPortfolioProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (activeFilter === 'all') {
      setFilteredProjects(projects);
    } else if (activeFilter === 'featured') {
      setFilteredProjects(projects.filter(project => project.is_featured));
    } else {
      setFilteredProjects(projects);
    }
  };

  const getUniqueServices = () => {
    const services = projects
      .map(project => project.service?.name)
      .filter((service, index, self) => 
        service && self.indexOf(service) === index
      );
    return services;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <section id="portfolio" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2A8]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="portfolio" 
      className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-[#00C2A8]/20 to-[#0066FF]/20 text-[#00C2A8] dark:text-[#00C2A8] text-sm font-semibold mb-4">
            <Briefcase className="inline-block w-4 h-4 mr-2" />
            Our Portfolio
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Showcasing Excellence
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Explore our diverse portfolio of successful projects that demonstrate our expertise, 
            creativity, and commitment to delivering exceptional results.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg shadow-[#00C2A8]/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveFilter('featured')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeFilter === 'featured'
                ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg shadow-[#00C2A8]/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
            }`}
          >
            <Star className="inline-block w-4 h-4 mr-2" />
            Featured
          </button>
          {getUniqueServices().map(service => (
            <button
              key={service}
              onClick={() => setActiveFilter(service || '')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeFilter === service
                  ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg shadow-[#00C2A8]/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
              }`}
            >
              {service}
            </button>
          ))}
        </motion.div>

        {/* Portfolio Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Briefcase className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeFilter === 'all' 
                ? 'No portfolio projects available yet.'
                : `No ${activeFilter} projects available.`
              }
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                {/* Featured Badge */}
                {project.is_featured && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  </div>
                )}

                {/* Image Container */}
                <div className="relative overflow-hidden h-64">
                  <img
                    src={project.featured_image}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Video Indicator */}
                  {project.video && (
                    <div className="absolute top-4 right-4 bg-black/50 rounded-full p-2">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                  )}

                  {/* View Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Service Tag */}
                  {project.service && (
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-xs font-semibold mb-3">
                      {project.service.name}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Client Info */}
                  {project.client_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <User className="w-4 h-4" />
                      <span>Client: {project.client_name}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <button className="flex items-center gap-1 text-[#00C2A8] dark:text-[#00C2A8] font-semibold group-hover:gap-2 transition-all duration-300">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#0066FF] to-purple-500">
            <div className="bg-white dark:bg-gray-900 rounded-xl px-8 py-6">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">
                Ready to Start Your Project?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Join our satisfied clients and let us bring your vision to life with our expertise.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
              >
                Start Your Project
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
            >
              <X className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>

            {/* Modal Content */}
            <div>
              {/* Hero Image */}
              <div className="relative h-96">
                <img
                  src={selectedProject.featured_image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Video Play Button */}
                {selectedProject.video && (
                  <button className="absolute inset-0 flex items-center justify-center group">
                    <div className="bg-black/50 rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle className="w-16 h-16 text-white" />
                    </div>
                  </button>
                )}

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {selectedProject.is_featured && (
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-bold">
                        Featured Project
                      </div>
                    )}
                    {selectedProject.service && (
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-sm font-bold">
                        {selectedProject.service.name}
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedProject.title}
                  </h2>
                  {selectedProject.client_name && (
                    <p className="text-gray-200 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Client: {selectedProject.client_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-8">
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Project Overview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Additional Images */}
                {selectedProject.images && selectedProject.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Gallery
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedProject.images.map((image: string, index: number) => (
                        <div
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                        >
                          <img
                            src={image}
                            alt={`${selectedProject.title} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent mb-2">
                      {new Date(selectedProject.created_at).toLocaleDateString('en-US', { 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent mb-2">
                      {selectedProject.service?.name || 'Various'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Service Category</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent mb-2">
                      {selectedProject.is_featured ? 'Featured' : 'Standard'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Project Type</div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                  <a
                    href="#contact"
                    onClick={() => setSelectedProject(null)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
                  >
                    Start Similar Project
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;