import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Mail, Phone } from 'lucide-react';

const services = [
  'Social Media Design',
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Branding',
  'Other'
];

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{success: boolean; message: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
      
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have a project in mind or want to learn more about our services? Drop us a message and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
            
            {submitStatus && (
              <div className={`p-4 mb-6 rounded-lg ${
                submitStatus.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {submitStatus.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent transition-all duration-300"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interested In
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent transition-all duration-300 appearance-none"
                >
                  <option value="">Select a service</option>
                  {services.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Have questions or want to discuss your project? Reach out to us through any of these channels.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#00C2A8]/10 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-[#00C2A8]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Our Office</h4>
                    <p className="text-gray-600 dark:text-gray-400">123 Business Avenue, Suite 456<br />Mumbai, Maharashtra 400001</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#0066FF]/10 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-[#0066FF]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Email Us</h4>
                    <a href="mailto:info@udyogworks.com" className="text-[#0066FF] hover:underline">info@udyogworks.com</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#0B2545]/10 dark:bg-[#00C2A8]/10 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-[#0B2545] dark:text-[#00C2A8]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Call Us</h4>
                    <a href="tel:+919876543210" className="text-gray-600 dark:text-gray-400 hover:underline">+91 98765 43210</a>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {[
                    { name: 'Facebook', icon: 'facebook', color: '#1877F2' },
                    { name: 'Twitter', icon: 'twitter', color: '#1DA1F2' },
                    { name: 'Instagram', icon: 'instagram', color: '#E4405F' },
                    { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={`https://${social.name.toLowerCase()}.com/udyogworks`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                      style={{ color: social.color }}
                      aria-label={social.name}
                    >
                      <i className={`fab fa-${social.icon} text-lg`}></i>
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] p-6 rounded-xl text-white">
                <h4 className="font-bold text-xl mb-2">Need Immediate Assistance?</h4>
                <p className="mb-4 text-white/90">Chat with our team on WhatsApp for quick responses.</p>
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white text-[#0066FF] hover:bg-gray-100 font-semibold py-2 px-6 rounded-full transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.498 14.382v3.3c0 .6.7.9 1.1.5l3.2-2.4c.4-.3.4-.8.2-1.1-2.6-3.6-7.1-4.1-10.5-1.9-2.6 1.7-3.8 4.9-2.8 7.8.1.4-.2.8-.6.8h-.3c-1.5 0-3.2-.8-4.3-2.2-3.3-4.1-2.4-9.9 2.1-13.2 3.4-2.5 8.1-2.3 11.2.6 3.1 2.9 3.7 7.6 1.5 11.2z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
