import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Code, PenTool, BookOpen, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Service data
const servicesData = {
  socialMedia: [
    {
      title: 'Graphics Designing',
      description: 'Eye-catching designs for your brand across all platforms',
      icon: <PenTool className="w-8 h-8 text-blue-500" />,
    },
    {
      title: 'Video Editing',
      description: 'Professional video editing for all your content needs',
      icon: <MessageSquare className="w-8 h-8 text-purple-500" />,
    },
    {
      title: 'Social Media Management',
      description: 'Complete management of your social media presence',
      icon: <MessageSquare className="w-8 h-8 text-pink-500" />,
    },
    {
      title: 'Branding Solutions',
      description: 'Comprehensive branding for your business',
      icon: <PenTool className="w-8 h-8 text-green-500" />,
    },
  ],
  software: [
    {
      title: 'Website Development',
      description: 'Custom websites tailored to your needs',
      icon: <Code className="w-8 h-8 text-indigo-500" />,
    },
    {
      title: 'Custom Software',
      description: 'Bespoke software solutions',
      icon: <Code className="w-8 h-8 text-blue-500" />,
    },
    {
      title: 'App Development',
      description: 'Mobile and web applications',
      icon: <Code className="w-8 h-8 text-purple-500" />,
    },
    {
      title: 'AI Solutions',
      description: 'AI-powered automations and tools',
      icon: <Code className="w-8 h-8 text-pink-500" />,
    },
  ],
  education: [
    {
      title: 'Assignments',
      description: 'Professional help with academic assignments',
      icon: <BookOpen className="w-8 h-8 text-amber-500" />,
    },
    {
      title: 'Projects',
      description: 'Complete project development and guidance',
      icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
    },
    {
      title: 'Research Papers',
      description: 'In-depth research and paper writing',
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
    },
    {
      title: 'Presentations',
      description: 'Professional presentation design',
      icon: <BookOpen className="w-8 h-8 text-purple-500" />,
    },
  ],
};

const ServicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const openServiceModal = (service: string) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Animation variants are defined inline where used

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Services</h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Comprehensive solutions tailored to your business needs with cutting-edge technology
              and creative expertise
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services Tabs */}
      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="socialMedia" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
              <TabsTrigger value="socialMedia">Social Media & Branding</TabsTrigger>
              <TabsTrigger value="software">Software & Web</TabsTrigger>
              <TabsTrigger value="education">Educational Services</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="socialMedia">
            <ServiceCategory 
              services={servicesData.socialMedia} 
              onServiceSelect={openServiceModal} 
            />
          </TabsContent>
          <TabsContent value="software">
            <ServiceCategory 
              services={servicesData.software} 
              onServiceSelect={openServiceModal} 
            />
          </TabsContent>
          <TabsContent value="education">
            <ServiceCategory 
              services={servicesData.education} 
              onServiceSelect={openServiceModal} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need a Custom Solution?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can create a tailored service to meet your specific requirements.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-indigo-700 hover:bg-gray-100 font-semibold text-lg px-8 py-6"
            onClick={() => openServiceModal('Custom Service')}
          >
            Request a Custom Service
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg"
              aria-label="Quick service request"
            >
              <Plus className="h-6 w-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Service</DialogTitle>
              <DialogDescription>
                {selectedService ? `Request our "${selectedService}" service` : 'Tell us about your project needs'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="service" className="text-sm font-medium">
                  Service
                </label>
                <Input 
                  id="service" 
                  value={selectedService} 
                  onChange={(e) => setSelectedService(e.target.value)}
                  placeholder="Service you're interested in"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="details" className="text-sm font-medium">
                  Project Details
                </label>
                <Textarea 
                  id="details" 
                  placeholder="Tell us more about your project..." 
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Send Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

const ServiceCategory = ({ services, onServiceSelect }: { services: any[], onServiceSelect: (service: string) => void }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {services.map((service, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
        >
          <div className="p-6">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => onServiceSelect(service.title)}
            >
              Request Service
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ServicesPage;
