import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin,} from 'lucide-react';
import { useState, useEffect } from 'react';
import { listServices, type Service } from '../../../api/services';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await listServices({ is_active: true });
      setServices(response.data.slice(0, 5)); // Limit to 5 services for footer
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHashLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    
    // Navigate to home page first if not already there
    if (window.location.pathname !== '/') {
      window.location.href = `/${hash}`;
      return;
    }
    
    // Scroll to section
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const footerLinks = [
    {
      title: 'Services',
      links: isLoading 
        ? [{ name: 'Loading...', url: '#' }]
        : services.length > 0
          ? services.map(service => ({
              name: service.title,
              url: `/client-dashboard/services#${service.slug || service.id}`
            }))
          : [{ name: 'No services found', url: '#' }]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', url: '#about', isHash: true },
        { name: 'Testimonials', url: '#testimonials', isHash: true },
        { name: 'Portfolio', url: '/portfolio' },
        { name: 'Blog', url: '/blog' },
        { name: 'LinkedIn', url: 'https://linkedin.com/company/udyogworks', external: true },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', url: '/help' },
        { name: 'Contact Us', url: '/#contact' },
        { name: 'Privacy Policy', url: '/privacy' },
        { name: 'Terms of Service', url: '/terms' },
        { name: 'FAQ', url: '/faq' },
      ]
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, url: 'https://facebook.com/udyogworks', label: 'Facebook' },
    { icon: <Twitter className="h-5 w-5" />, url: 'https://twitter.com/udyogworks', label: 'Twitter' },
    { icon: <Instagram className="h-5 w-5" />, url: 'https://instagram.com/udyogworks', label: 'Instagram' },
    { icon: <Linkedin className="h-5 w-5" />, url: 'https://linkedin.com/company/udyogworks', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white font-bold text-2xl px-3 py-1 rounded">
                UdyogWorks
              </div>
            </div>
            <p className="text-gray-400">
              Empowering businesses with innovative digital solutions. We help you build, create, and grow your online presence.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full text-gray-300 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-white font-semibold text-lg">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#00C2A8] transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </a>
                    ) : link.isHash ? (
                      <a
                        href={link.url}
                        onClick={(e) => handleHashLinkClick(e, link.url)}
                        className="text-gray-400 hover:text-[#00C2A8] transition-colors duration-300 text-sm cursor-pointer"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.url}
                        className="text-gray-400 hover:text-[#00C2A8] transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 text-center md:text-left mb-4 md:mb-0">
            © {currentYear} UdyogWorks. All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center space-x-6">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-gray-500 hover:text-white transition-colors duration-300">
              Cookie Policy
            </Link>
            <Link to="/sitemap" className="text-sm text-gray-500 hover:text-white transition-colors duration-300">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

