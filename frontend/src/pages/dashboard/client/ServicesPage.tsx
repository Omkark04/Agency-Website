import { useState, useEffect } from 'react';
import { listServices } from '../../../api/services';
import type { Service } from '../../../api/services';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

import { motion } from 'framer-motion';
import { 
  Star, 
  ArrowRight,
  CheckCircle,
  DollarSign,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
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

  const openServiceModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
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
                  {services.map(s => s.department).filter((v, i, a) => a.indexOf(v) === i).map(deptId => (
                    <option key={deptId} value={deptId.toString()}>
                      Department {deptId}
                    </option>
                  ))}
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

      {/* Service Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      {selectedService.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      Request this service for your project
                    </DialogDescription>
                  </div>
                  {selectedService.is_featured && (
                    <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm">
                      <Star className="w-4 w-4 mr-1" />
                      Featured
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* Service Details */}
              <div className="space-y-6">
                {/* Service Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Service Overview</h4>
                  <p className="text-gray-600 text-sm">{selectedService.long_description || selectedService.short_description}</p>
                </div>

                {/* Pricing */}
                {selectedService.original_price && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium text-gray-500 mb-1">Starting Price</div>
                      <div className="text-lg font-bold text-gray-900">₹{selectedService.original_price.toLocaleString()}</div>
                    </div>
                  </div>
                )}

                {/* Key Features */}
                {selectedService.features && selectedService.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                    <div className="space-y-2">
                      {selectedService.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Form */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Request Service</h4>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Project Description</label>
                      <Textarea 
                        placeholder="Describe your project requirements in detail..."
                        rows={4}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Additional Requirements</label>
                      <Textarea 
                        placeholder="Any specific requirements or preferences..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Attachments</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-500">Drag & drop files or click to upload</div>
                        <div className="text-xs text-gray-400 mt-1">Max file size: 10MB</div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsModalOpen(false)}
                        className="text-sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm"
                      >
                        Submit Request
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Service Card Component (Grid View)
const ServiceCard = ({ service, onSelect }: { service: Service; onSelect: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {service.logo && (
              <img src={service.logo} alt={service.title} className="w-10 h-10 rounded-lg" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                {service.is_featured && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              {service.department_title && (
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {service.department_title}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.short_description}</p>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-2 mb-4">
            {service.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 truncate">{feature.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        {service.original_price && (
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1" />
              ₹{service.original_price.toLocaleString()}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm font-medium"
        >
          Request Service
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
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
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap"
        >
          Request
          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ServicesPage;
