import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  ExternalLink, 
  X, 
  ChevronRight,
  Star,
  Calendar,
  User,
  Briefcase,
  PlayCircle,
  Filter,
  Grid,
  List,
  Sparkles,
  ChevronLeft,
  ZoomIn
} from 'lucide-react';
import { Button as MovingBorderContainer } from "@/components/ui/moving-border";
import { fetchPortfolioProjects } from '../../../api/portfolio';
import type { PortfolioProject } from '../../../api/portfolio';
import { useProtectedNavigation } from '../../../hooks/useProtectedNavigation';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/Toast';
import AuthModal from './AuthModal';
import DynamicFormRenderer from '../../../components/forms/DynamicFormRenderer';

const PortfolioSection = () => {
  const navigate = useNavigate();
  const { navigateTo, showAuthModal, setShowAuthModal } = useProtectedNavigation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'featured'>('newest');
  
  // Service form modal state
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [serviceFormProject, setServiceFormProject] = useState<PortfolioProject | null>(null);
  
  // Image lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Gallery slider state for modal
  const [galleryIndex, setGalleryIndex] = useState(0);


  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, activeFilter, searchTerm, sortBy, viewMode]);

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

  const getUniqueServices = () => {
    const services = projects
      .map(project => project.service?.name)
      .filter((service, index, self) => 
        service && self.indexOf(service) === index
      );
    return services;
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply category filter
    if (activeFilter === 'featured') {
      filtered = filtered.filter(project => project.is_featured);
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(project => project.service?.name === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'featured':
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  // Handle Start Similar Project button click
  const handleStartSimilarProject = (project: PortfolioProject) => {
    if (!project.service) {
      showToast('error', 'This project has no associated service');
      return;
    }
    setServiceFormProject(project);
    setIsServiceFormOpen(true);
    setSelectedProject(null); // Close the detail modal
  };

  // Handle form submission success
  const handleFormSuccess = (orderId: number) => {
    showToast('success', `Order #${orderId} created successfully!`);
    setIsServiceFormOpen(false);
    setServiceFormProject(null);
    
    // Only redirect to client dashboard if user was already authenticated
    // The DynamicFormRenderer handles its own auth flow
    if (isAuthenticated) {
      setTimeout(() => {
        navigate('/client-dashboard/orders');
      }, 2000);
    }
  };

  // Open image in lightbox
  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxImage(null);
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

  // Loading state remains the same...
  if (loading) {
    return (
      <section id="portfolio" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
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
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        {/* Section Header - Updated with better layout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-gradient-to-r from-[#00C2A8]/20 to-[#0066FF]/20 text-[#00C2A8] dark:text-[#00C2A8] text-xs md:text-sm font-semibold tracking-wide mb-3 md:mb-4">
            <Briefcase className="inline-block w-3 h-3 md:w-4 md:h-4 mr-2" />
            Our Portfolio
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight leading-tight px-4">
            Showcasing Excellence
          </h2>
          <p className="hidden md:block text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
            Explore our diverse portfolio of successful projects that demonstrate our expertise, 
            creativity, and commitment to delivering exceptional results.
          </p>
          
          {/* Search Bar - Hidden on Mobile */}
          <div className="hidden md:block max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by title, description, or client..."
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#00C2A8] focus:ring-4 focus:ring-[#00C2A8]/20 transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters & Controls Section - Hidden on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden md:block mb-12"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
              </div>
              
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg shadow-[#00C2A8]/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg border border-gray-200 dark:border-gray-700'
                }`}
              >
                All Projects ({projects.length})
              </button>
              
              <button
                onClick={() => setActiveFilter('featured')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  activeFilter === 'featured'
                    ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg shadow-[#00C2A8]/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Star className="w-4 h-4" />
                Featured
              </button>
              
              {getUniqueServices().map(service => (
                <button
                  key={service}
                  onClick={() => setActiveFilter(service || '')}
                  className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    activeFilter === service
                      ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg shadow-[#00C2A8]/30'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00C2A8]/30 focus:border-[#00C2A8] transition-all duration-300 font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="featured">Featured First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Counter */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 rounded-full">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} for "{searchTerm}"
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Portfolio Grid/List View */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl mb-6">
              <Briefcase className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {searchTerm
                ? `No projects match "${searchTerm}". Try different keywords or clear the search.`
                : activeFilter !== 'all'
                ? `No ${activeFilter} projects available. Try another filter.`
                : 'No portfolio projects available yet.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            {/* Desktop Grid View */}
            {viewMode === 'grid' ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="relative z-0"
                    onClick={() => setSelectedProject(project)}
                  >
                    <MovingBorderContainer
                      borderRadius="1rem"
                      containerClassName="w-full h-full bg-transparent p-[3px]"
                      className="bg-white dark:bg-gray-800 border-neutral-200 dark:border-gray-700 p-0 overflow-hidden items-start justify-start flex-col h-full w-full"
                      duration={Math.floor(Math.random() * 2000) + 2000} // Random duration for variety
                      as="div"
                    >
                      <div className="group relative w-full h-full"> 
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
                            loading="lazy"
                            decoding="async"
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
                      </div>
                    </MovingBorderContainer>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* List View */
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={itemVariants}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image Container */}
                      <div className="relative md:w-1/3 overflow-hidden">
                        <img
                          src={project.featured_image}
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-64 md:h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        {project.is_featured && (
                          <div className="absolute top-4 left-4">
                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Featured
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col h-full">
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {project.service && (
                                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-xs font-semibold">
                                  {project.service.name}
                                </div>
                              )}
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(project.created_at).toLocaleDateString()}
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                              {project.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                              {project.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                            {project.client_name && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <User className="w-4 h-4" />
                                <span>Client: {project.client_name}</span>
                              </div>
                            )}
                            
                            <button className="flex items-center gap-2 text-[#00C2A8] dark:text-[#00C2A8] font-semibold group-hover:gap-3 transition-all duration-300">
                              View Full Case Study
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-4 pb-4">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="flex-shrink-0 w-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => setSelectedProject(project)}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={project.featured_image}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Featured Badge */}
                      {project.is_featured && (
                        <div className="absolute top-3 left-3">
                          <div className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </div>
                        </div>
                      )}
                      
                      {/* Video Indicator */}
                      {project.video && (
                        <div className="absolute top-3 right-3 bg-black/50 rounded-full p-1.5">
                          <PlayCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Service Tag */}
                      {project.service && (
                        <div className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-xs font-semibold mb-2">
                          {project.service.name}
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 tracking-tight leading-tight">
                        {project.title}
                      </h3>

                      {/* Client Info */}
                      {project.client_name && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <User className="w-3 h-3" />
                          <span className="line-clamp-1">{project.client_name}</span>
                        </div>
                      )}

                      {/* View Button */}
                      <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-sm font-semibold tracking-wide hover:shadow-lg transition-all duration-300">
                        View Details
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom Border */}
                    <div className="h-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF]" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Results Counter & View Complete Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  Showing <span className="font-bold text-[#00C2A8]">{filteredProjects.length}</span> of{' '}
                  <span className="font-bold">{projects.length}</span> total projects
                  {activeFilter !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                      Filtered by: {activeFilter}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => navigateTo('/portfolio')}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:from-[#00A58E] hover:to-[#0052CC] text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
                >
                  <span>View Complete Portfolio</span>
                  <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:mt-20"
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#0066FF] to-purple-500">
            <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-6 md:px-8 md:py-6">
              <h3 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent tracking-tight">
                Ready to Start Your Project?
              </h3>
              <p className="hidden md:block text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                Join our satisfied clients and let us bring your vision to life with our expertise.
              </p>
              <button
                onClick={() => navigateTo('/portfolio')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold tracking-wide hover:shadow-lg hover:shadow-[#00C2A8]/30 transition-all duration-300 transform hover:scale-105"
              >
                Start Your Project
                <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Project Detail Modal (same as before) */}
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
                
                {/* Eye Button to View Full Image */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(selectedProject.featured_image);
                  }}
                  className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all duration-300 transform hover:scale-110 z-10"
                  title="View full image"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                
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

                {/* Additional Images - Horizontal Slider */}
                {selectedProject.images && selectedProject.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Gallery
                    </h3>
                    <div className="relative">
                      {/* Horizontal Scroll Container */}
                      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-4 pb-4">
                          {selectedProject.images.map((image: string, index: number) => (
                            <div
                              key={index}
                              className="relative flex-shrink-0 w-48 sm:w-56 md:w-64 aspect-square rounded-xl overflow-hidden group cursor-pointer"
                              onClick={() => openLightbox(image)}
                            >
                              <img
                                src={image}
                                alt={`${selectedProject.title} - ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                              {/* Eye Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLightbox(image);
                                }}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              >
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                                  <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Scroll Indicator */}
                      {selectedProject.images.length > 3 && (
                        <div className="flex justify-center mt-3 gap-1">
                          {selectedProject.images.map((_, index) => (
                            <div 
                              key={index}
                              className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"
                            />
                          ))}
                        </div>
                      )}
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
                  <button
                    onClick={() => handleStartSimilarProject(selectedProject)}
                    disabled={!selectedProject.service}
                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedProject.service
                        ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white hover:shadow-lg hover:shadow-[#00C2A8]/30'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    Start Similar Project
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Service Form Modal */}
      {isServiceFormOpen && serviceFormProject && serviceFormProject.service && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setIsServiceFormOpen(false);
                setServiceFormProject(null);
              }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Start Similar Project: {serviceFormProject.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Service: {serviceFormProject.service.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Fill out the form below to request a custom version of this project
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsServiceFormOpen(false);
                      setServiceFormProject(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <DynamicFormRenderer
                  serviceId={serviceFormProject.service.id}
                  portfolioProjectId={serviceFormProject.id}
                  onSuccess={handleFormSuccess}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-5xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Full view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;
