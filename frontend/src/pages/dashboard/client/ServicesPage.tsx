import { useState, useEffect } from 'react';
import { listServices } from '../../../api/services';
import { getFormByService } from '../../../api/forms';
import type { Service } from '../../../api/services';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import PriceCardSelector from '../../../components/PriceCardSelector';
// Use existing DynamicFormRenderer component
import DynamicFormRenderer from '../../../components/forms/DynamicFormRenderer';

import { motion } from 'framer-motion';
import { 
  Star, 
  ArrowRight,
  CheckCircle,
  DollarSign,
  Search,
  ChevronDown,
  X,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form integration states
  const [modalStep, setModalStep] = useState<'select-plan' | 'fill-form'>('select-plan');
  const [selectedPriceCard, setSelectedPriceCard] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const servicesRes = await listServices({ is_active: true });
      setServices(servicesRes.data || []);
    } catch (err) {
      setError('Failed to load services');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openServiceModal = async (service: Service) => {
    try {
      setSelectedService(service);
      setFormLoading(true);
      setIsModalOpen(true);
      
      // Type guard to ensure service.id exists
      if (!service.id) {
        throw new Error('Service ID is required');
      }
      
      console.log('Fetching form for service ID:', service.id);
      
      // Fetch form for this service using the same API as FormBuilder
      const response = await getFormByService(service.id);
      console.log('Form fetch response:', response);
      
      // Start with price card selection
      setModalStep('select-plan');
    } catch (error: any) {
      console.error('Failed to fetch service form:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail ||
                          'No custom form available for this service. Please contact support.';
      alert(errorMessage);
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePriceCardSelect = (priceCard: any) => {
    setSelectedPriceCard(priceCard);
    setModalStep('fill-form');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStep('select-plan');
    setSelectedPriceCard(null);
    setSelectedService(null);
  };

  const handleBackToPriceSelection = () => {
    setModalStep('select-plan');
    setSelectedPriceCard(null);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = searchQuery === '' || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.department === parseInt(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading services..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <EmptyState
          icon="alert"
          title="Error loading services"
          description={error}
          action={{
            label: 'Try Again',
            onClick: fetchData
          }}
        />
      </div>
    );
  }

  return (
    <div id='Services' className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Our Services</h1>
              <p className="text-gray-600 mt-1">Browse and request professional services tailored to your needs</p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{services.length}</div>
                <div className="text-sm text-gray-500">Total Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4.8</div>
                <div className="text-sm text-gray-500">Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                className="pl-10 pr-4 py-2.5 w-full border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Departments</option>
                  {Array.from(new Set(services.map(s => s.department))).map(deptId => {
                    const deptTitle = services.find(s => s.department === deptId)?.department_title || `Department ${deptId}`;
                    return (
                      <option key={deptId} value={deptId.toString()}>
                        {deptTitle}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="grid grid-cols-2 gap-1 w-5 h-5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex flex-col space-y-0.5 w-5 h-5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-full h-0.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || categoryFilter !== 'all') && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('all')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No services found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}>
              Clear all filters
            </Button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredServices.map(service => (
              <ServiceListItem 
                key={service.id} 
                service={service} 
                onSelect={() => openServiceModal(service)} 
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onSelect={() => openServiceModal(service)} 
              />
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{services.length}</div>
              <div className="text-sm text-gray-600">Available Services</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">4.8/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">98%</div>
              <div className="text-sm text-gray-600">Client Satisfaction</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-amber-600">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Request Modal with 2-Step Flow */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      {selectedService.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      {modalStep === 'select-plan' ? 'Choose your pricing plan' : 'Fill out the service request form'}
                    </DialogDescription>
                  </div>
                  {selectedService.is_featured && (
                    <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm">
                      <Star className="w-4 h-4 mr-1" />
                      Featured
                    </div>
                  )}
                </div>
              </DialogHeader>

              {formLoading ? (
                <div className="py-12">
                  <LoadingSpinner size="md" text="Loading form..." />
                </div>
              ) : (
                <div className="mt-4">
                  {modalStep === 'select-plan' ? (
                    /* Step 1: Price Card Selection */
                    <PriceCardSelector
                      serviceId={selectedService.id}
                      onSelect={handlePriceCardSelect}
                      onCancel={handleCloseModal}
                    />
                  ) : (
                    /* Step 2: Custom Form */
                    <div>
                      {/* Selected Plan Summary */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-blue-900">Selected Plan: {selectedPriceCard?.title}</h3>
                            <p className="text-blue-700 text-sm mt-1">Price: ₹{selectedPriceCard?.price?.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={handleBackToPriceSelection}
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Change Plan
                          </button>
                        </div>
                      </div>

                      {/* Custom Form from Form Builder */}
                      {selectedService && selectedService.id ? (
                        <DynamicFormRenderer
                          serviceId={selectedService.id}
                          priceCardId={selectedPriceCard?.id}
                          onSuccess={(orderId) => {
                            alert(`Service request submitted successfully! Order #${orderId} created.`);
                            handleCloseModal();
                          }}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No form available for this service</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Service Card Component (Grid View) - Premium Admin Style
const ServiceCard = ({ service, onSelect }: { service: Service; onSelect: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Floating gradient blur element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-[#1E40AF]/10 rounded-full blur-3xl group-hover:from-[#2563EB]/20 group-hover:to-[#1E40AF]/20 transition-all duration-500"></div>
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/0 via-[#1E40AF]/0 to-[#2563EB]/0 group-hover:from-[#2563EB]/5 group-hover:via-[#1E40AF]/5 group-hover:to-[#2563EB]/5 transition-all duration-500"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {service.logo && (
              <motion.img 
                src={service.logo} 
                alt={service.title} 
                className="w-12 h-12 rounded-xl shadow-md"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                {service.is_featured && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </motion.div>
                )}
              </div>
              {service.department_title && (
                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-[#1E40AF] rounded-full border border-blue-200">
                  {service.department_title}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{service.short_description}</p>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-2 mb-4">
            {service.features.slice(0, 3).map((feature, index) => (
              <motion.div 
                key={index} 
                className="flex items-center text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="p-1 bg-green-50 rounded-full mr-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-gray-700 truncate">{feature.title}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Price */}
        {service.original_price && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-4 border border-gray-200">
            <div className="flex items-center text-gray-600">
              <div className="p-1.5 bg-white rounded-lg mr-2 shadow-sm">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Starting from</span>
            </div>
            <span className="text-lg font-black text-gray-900">₹{service.original_price.toLocaleString()}</span>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={onSelect}
          className="w-full flex items-center justify-center bg-gradient-to-r from-[#2563EB] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
        >
          Request Service
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#1E40AF] to-[#2563EB] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
    </motion.div>
  );
};

// Service List Item Component (List View)
const ServiceListItem = ({ service, onSelect }: { service: Service; onSelect: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {service.logo && (
            <img src={service.logo} alt={service.title} className="w-12 h-12 rounded-lg" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{service.title}</h3>
              {service.is_featured && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2 line-clamp-1">{service.short_description}</p>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {service.original_price && (
                <span className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ₹{service.original_price.toLocaleString()}
                </span>
              )}
              {service.department_title && (
                <span className="px-2 py-0.5 bg-gray-100 rounded">
                  {service.department_title}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button 
          onClick={onSelect}
          size="sm"
          className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] whitespace-nowrap"
        >
          Request
          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ServicesPage;
