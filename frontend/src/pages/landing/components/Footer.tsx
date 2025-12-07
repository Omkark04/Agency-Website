import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Services',
      links: [
        { name: 'Social Media Design', url: '/services#social-media' },
        { name: 'Web Development', url: '/services#web-dev' },
        { name: 'Mobile Apps', url: '/services#mobile' },
        { name: 'UI/UX Design', url: '/services#design' },
        { name: 'Branding', url: '/services#branding' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', url: '/about' },
        { name: 'Our Team', url: '/team' },
        { name: 'Case Studies', url: '/case-studies' },
        { name: 'Careers', url: '/careers' },
        { name: 'Blog', url: '/blog' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', url: '/help' },
        { name: 'Contact Us', url: '/contact' },
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
      <div className="container mx-auto px-4">
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
            
            <div className="pt-4 border-t border-gray-800">
              <h4 className="font-semibold text-white mb-3">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#00C2A8] w-full"
                />
                <button className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold px-4 rounded-r-lg transition-all duration-300">
                  Subscribe
                </button>
              </div>
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
                    <Link
                      to={link.url}
                      className="text-gray-400 hover:text-[#00C2A8] transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-white font-semibold text-lg">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-[#00C2A8] mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-white">Our Office</h4>
                  <p className="text-sm text-gray-400">123 Business Avenue, Suite 456<br />Mumbai, Maharashtra 400001</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-[#00C2A8] mr-3 flex-shrink-0" />
                <a href="mailto:info@udyogworks.com" className="text-gray-400 hover:text-[#00C2A8] transition-colors duration-300 text-sm">
                  info@udyogworks.com
                </a>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-[#00C2A8] mr-3 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-[#00C2A8] transition-colors duration-300 text-sm">
                  +91 98765 43210
                </a>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <h4 className="font-semibold text-white mb-3">Business Hours</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </motion.div>
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
