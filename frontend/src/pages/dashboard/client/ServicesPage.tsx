import { useState } from 'react';

interface Pricing {
  basic: string;
  standard: string;
  premium: string;
  [key: string]: string; // For additional dynamic keys
}
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Code, 
  PenTool, 
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Shield,
  Calendar,
  Star,
  Filter,
  Search,
  ChevronDown,
  X,
  Sparkles
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

// Enhanced service data with detailed information
const servicesData = {
  socialMedia: [
    {
      id: 1,
      title: 'Graphics Designing',
      description: 'Professional graphic design solutions for social media, branding, and marketing materials',
      detailedDescription: 'We provide comprehensive graphic design services including social media graphics, logos, branding materials, brochures, and print materials. Our team of experienced designers ensures your brand stands out.',
      icon: <PenTool className="w-6 h-6" />,
      features: [
        'Social Media Graphics',
        'Logo & Brand Identity Design',
        'Print Materials & Brochures',
        'Digital Marketing Assets',
        'Packaging Design'
      ],
      pricing: {
        basic: '$499',
        standard: '$899',
        premium: '$1499'
      },
      deliveryTime: '3-7 business days',
      requirements: [
        'Brand guidelines (if available)',
        'Content and text',
        'Reference materials',
        'Preferred color schemes'
      ],
      category: 'Design',
      popular: true,
      rating: 4.8,
      completedProjects: 156
    },
    {
      id: 2,
      title: 'Video Editing',
      description: 'Professional video editing for commercials, social media content, and corporate videos',
      detailedDescription: 'Transform your raw footage into compelling video content. We specialize in video editing for commercials, social media, corporate videos, and personal projects.',
      icon: <MessageSquare className="w-6 h-6" />,
      features: [
        'Commercial Video Editing',
        'Social Media Content',
        'Corporate Videos',
        'Motion Graphics',
        'Color Correction'
      ],
      pricing: {
        basic: '$799',
        standard: '$1499',
        premium: '$2499'
      },
      deliveryTime: '5-10 business days',
      requirements: [
        'Raw video footage',
        'Reference videos',
        'Music preferences',
        'Brand guidelines'
      ],
      category: 'Video',
      popular: true,
      rating: 4.7,
      completedProjects: 98
    },
  ],
  software: [
    {
      id: 3,
      title: 'Website Development',
      description: 'Custom website development with modern frameworks and responsive design',
      detailedDescription: 'Build professional websites tailored to your business needs. From simple landing pages to complex web applications, we deliver responsive, SEO-friendly websites.',
      icon: <Code className="w-6 h-6" />,
      features: [
        'Custom Website Design',
        'Responsive Development',
        'CMS Integration',
        'E-commerce Solutions',
        'SEO Optimization'
      ],
      pricing: {
        basic: '$2499',
        standard: '$4999',
        premium: '$8999'
      },
      deliveryTime: '15-30 business days',
      requirements: [
        'Project requirements document',
        'Design references',
        'Content and images',
        'Hosting preferences'
      ],
      category: 'Development',
      popular: true,
      rating: 4.9,
      completedProjects: 203
    },
    {
      id: 4,
      title: 'App Development',
      description: 'Native and cross-platform mobile application development',
      detailedDescription: 'Create powerful mobile applications for iOS and Android. We develop user-friendly, scalable apps with modern features and seamless performance.',
      icon: <Code className="w-6 h-6" />,
      features: [
        'iOS & Android Apps',
        'Cross-Platform Development',
        'App Store Deployment',
        'API Integration',
        'Maintenance & Support'
      ],
      pricing: {
        basic: '$4999',
        standard: '$9999',
        premium: '$19999'
      },
      deliveryTime: '30-60 business days',
      requirements: [
        'Detailed project specification',
        'Design wireframes',
        'Target platform requirements',
        'Integration requirements'
      ],
      category: 'Development',
      popular: false,
      rating: 4.6,
      completedProjects: 87
    },
  ],
  education: [
    {
      id: 5,
      title: 'Assignments',
      description: 'Professional assistance with academic assignments and homework',
      detailedDescription: 'Get expert help with academic assignments across various subjects. We ensure high-quality work with proper research and timely delivery.',
      icon: <BookOpen className="w-6 h-6" />,
      features: [
        'Research & Writing',
        'Plagiarism-Free Content',
        'Proper Citation',
        'Multiple Revisions',
        'Timely Delivery'
      ],
      pricing: {
        basic: '$49 per page',
        standard: '$69 per page',
        premium: '$99 per page'
      },
      deliveryTime: '1-3 days',
      requirements: [
        'Assignment instructions',
        'Subject details',
        'Deadline',
        'Formatting guidelines'
      ],
      category: 'Academic',
      popular: true,
      rating: 4.8,
      completedProjects: 312
    },
    {
      id: 6,
      title: 'Research Papers',
      description: 'In-depth research and professional paper writing services',
      detailedDescription: 'Professional research paper writing with thorough analysis, proper methodology, and academic excellence across various disciplines.',
      icon: <FileText className="w-6 h-6" />,
      features: [
        'Comprehensive Research',
        'Professional Writing',
        'Statistical Analysis',
        'Literature Review',
        'Formatting & Editing'
      ],
      pricing: {
        basic: '$299',
        standard: '$599',
        premium: '$999'
      },
      deliveryTime: '7-14 days',
      requirements: [
        'Research topic',
        'Paper requirements',
        'Academic level',
        'Reference style'
      ],
      category: 'Academic',
      popular: true,
      rating: 4.9,
      completedProjects: 167
    },
  ],
};

const ServicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const openServiceModal = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Flatten all services for search and filter
  const allServices = [
    ...servicesData.socialMedia,
    ...servicesData.software,
    ...servicesData.education
  ];

  const filteredServices = allServices.filter(service => {
    const matchesSearch = searchQuery === '' || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category.toLowerCase() === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(allServices.map(s => s.category.toLowerCase()))];

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
                <div className="text-2xl font-bold text-blue-600">{allServices.length}</div>
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
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
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
              <div className="text-2xl font-bold text-blue-600">{allServices.length}</div>
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
                  {selectedService.popular && (
                    <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm">
                      <Star className="w-4 h-4 mr-1" />
                      Popular
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* Service Details */}
              <div className="space-y-6">
                {/* Service Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Service Overview</h4>
                  <p className="text-gray-600 text-sm">{selectedService.detailedDescription}</p>
                </div>

                {/* Pricing Options */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing Packages</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(selectedService.pricing as Pricing).map(([plan, price]: [string, string]) => (
                      <div key={plan} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-sm font-medium text-gray-500 capitalize mb-1">{plan}</div>
                        <div className="text-lg font-bold text-gray-900">{price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                  <div className="space-y-2">
                    {selectedService.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                  <div className="space-y-2">
                    {selectedService.requirements.map((req: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-gray-700 text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{selectedService.deliveryTime}</div>
                      <div className="text-xs text-gray-500">Delivery Time</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{selectedService.completedProjects}</div>
                      <div className="text-xs text-gray-500">Projects Completed</div>
                    </div>
                  </div>
                </div>

                {/* Request Form */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Request Service</h4>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Package</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                          <option value="">Select a package</option>
                          {Object.entries(selectedService.pricing as Pricing).map(([plan, price]: [string, string]) => (
                            <option key={plan} value={plan}>
                              {plan.charAt(0).toUpperCase() + plan.slice(1)} - {price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Urgency</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                          <option value="normal">Normal (Standard Timeline)</option>
                          <option value="urgent">Urgent (+50% fee)</option>
                          <option value="express">Express (+100% fee)</option>
                        </select>
                      </div>
                    </div>

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
const ServiceCard = ({ service, onSelect }: { service: any; onSelect: () => void }) => {
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
            <div className="p-2.5 rounded-lg bg-blue-50">
              <div className="text-blue-600">{service.icon}</div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                {service.popular && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {service.category}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {service.features.slice(0, 3).map((feature: string, index: number) => (
            <div key={index} className="flex items-center text-sm">
              <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700 truncate">{feature}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {service.deliveryTime}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-3.5 h-3.5 mr-1" />
            From {service.pricing.basic}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(service.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900">{service.rating}</span>
          </div>
          <span className="text-xs text-gray-500">{service.completedProjects} projects</span>
        </div>

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
const ServiceListItem = ({ service, onSelect }: { service: any; onSelect: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-blue-50">
            <div className="text-blue-600">{service.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{service.title}</h3>
              {service.popular && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2 line-clamp-1">{service.description}</p>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {service.deliveryTime}
              </span>
              <span className="flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                From {service.pricing.basic}
              </span>
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                {service.rating}/5
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded">
                {service.category}
              </span>
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