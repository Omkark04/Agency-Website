import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PortfolioHeader } from '../components/portfolio/PortfolioHeader';
import { PortfolioCard } from '../components/portfolio/PortfolioCard';
import { PortfolioFilters } from '../components/portfolio/PortfolioFilters';
import { Footer } from './landing/components/Footer';
import DynamicFormRenderer from '../components/forms/DynamicFormRenderer';
import { fetchPortfolioProjects, type PortfolioProject } from '../api/portfolio';
import { listDepartments, type Department } from '../api/departments';
import { listServices, type Service } from '../api/services';
import { useToast } from '../components/Toast';

export const PortfolioPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State
  const [portfolios, setPortfolios] = useState<PortfolioProject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPortfolios();
  }, [selectedDepartment, selectedService]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptResponse, servicesResponse] = await Promise.all([
        listDepartments({ is_active: true }),
        listServices({ is_active: true })
      ]);
      
      setDepartments(deptResponse.data);
      setServices(servicesResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('error', 'Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolios = async () => {
    try {
      const params: any = {};
      if (selectedService) {
        params.service = selectedService;
      }
      
      const projects = await fetchPortfolioProjects(params);
      setPortfolios(projects);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
      showToast('error', 'Failed to load portfolio projects');
    }
  };

  const handleCustomize = (project: PortfolioProject) => {
    if (!project.service) {
      showToast('error', 'This project has no associated service');
      return;
    }
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleFormSuccess = (orderId: number) => {
    showToast('success', `Order #${orderId} created successfully!`);
    setIsModalOpen(false);
    setSelectedProject(null);
    
    // Redirect to client dashboard after 2 seconds
    setTimeout(() => {
      navigate('/client-dashboard/orders');
    }, 2000);
  };

  // Filter portfolios by search term
  const filteredPortfolios = portfolios.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Generate masonry grid pattern (small, regular, large)
  const getSizePattern = (index: number): 'small' | 'regular' | 'large' => {
    const pattern = [
      'regular', 'large', 'small', 'regular', 'small', 'large',
      'regular', 'regular', 'large', 'small', 'regular', 'small'
    ];
    return pattern[index % pattern.length] as 'small' | 'regular' | 'large';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <PortfolioHeader />

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 rounded-full mb-4">
              <Briefcase className="h-5 w-5 text-[#00C2A8]" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Our Work Portfolio
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our <span className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">Success Stories</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Browse through our portfolio and customize any project to fit your business needs
            </p>
          </motion.div>

          {/* Filters */}
          <PortfolioFilters
            departments={departments}
            services={services}
            selectedDepartment={selectedDepartment}
            selectedService={selectedService}
            searchTerm={searchTerm}
            onDepartmentChange={setSelectedDepartment}
            onServiceChange={setSelectedService}
            onSearchChange={setSearchTerm}
          />

          {/* Portfolio Grid - Masonry Layout */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-12 w-12 animate-spin text-[#00C2A8]" />
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No portfolio projects found
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
              {filteredPortfolios.map((project, index) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                  size={getSizePattern(index)}
                  onCustomize={handleCustomize}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Service Form Modal */}
      {isModalOpen && selectedProject && selectedProject.service && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedProject(null);
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
                      Customize: {selectedProject.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Service: {selectedProject.service.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Fill out the form below to request a custom version of this project
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedProject(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body - Direct Form Rendering (No Price Card Selection) */}
              <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <DynamicFormRenderer
                  serviceId={selectedProject.service.id}
                  onSuccess={handleFormSuccess}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
