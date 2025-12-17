import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  FileText, 
  CreditCard, 
  Settings, 
  ChevronDown,
  Mail,
  Phone,
  ArrowLeft
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    // Getting Started
    {
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button in the top right corner of the homepage. Fill in your details including name, email, and password. You\'ll receive a confirmation email to verify your account.'
    },
    {
      category: 'Getting Started',
      question: 'What services do you offer?',
      answer: 'We offer a wide range of digital services including Web Development, Mobile App Development, UI/UX Design, Social Media Marketing, Branding, and Business Consulting. Visit our Services page to explore all offerings.'
    },
    {
      category: 'Getting Started',
      question: 'How do I place an order?',
      answer: 'Browse our services, select the one you need, fill out the service form with your requirements, and submit. Our team will review and contact you with a quotation and timeline.'
    },
    
    // Orders & Payments
    {
      category: 'Orders & Payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including Credit/Debit Cards, Net Banking, UPI, and Bank Transfers. All payments are processed securely through our payment gateway.'
    },
    {
      category: 'Orders & Payments',
      question: 'How can I track my order status?',
      answer: 'Log in to your dashboard and navigate to "My Projects" or "Orders" section. You\'ll see real-time updates on your project progress, including milestones and completion percentage.'
    },
    {
      category: 'Orders & Payments',
      question: 'Can I cancel or modify my order?',
      answer: 'You can request order modifications or cancellations within 24 hours of placing the order. Contact our support team through the dashboard or email us at support@udyogworks.com.'
    },
    {
      category: 'Orders & Payments',
      question: 'Do you offer refunds?',
      answer: 'Refunds are available based on our refund policy. If work hasn\'t started, you\'re eligible for a full refund. Partial refunds may apply for work in progress. Please refer to our Terms of Service for detailed information.'
    },
    
    // Services
    {
      category: 'Services',
      question: 'How long does a typical project take?',
      answer: 'Project timelines vary based on complexity and scope. Simple websites may take 2-4 weeks, while complex applications can take 2-6 months. We provide detailed timelines during the quotation phase.'
    },
    {
      category: 'Services',
      question: 'Do you provide ongoing support after project completion?',
      answer: 'Yes! We offer maintenance and support packages for all our services. This includes bug fixes, updates, and technical support. Contact us to discuss a support plan that fits your needs.'
    },
    {
      category: 'Services',
      question: 'Can I request custom features?',
      answer: 'Absolutely! We specialize in custom solutions tailored to your specific requirements. Describe your needs in the service form, and our team will provide a custom quotation.'
    },
    
    // Account Management
    {
      category: 'Account Management',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to set a new password.'
    },
    {
      category: 'Account Management',
      question: 'How can I update my profile information?',
      answer: 'Log in to your dashboard, click on your profile icon in the top right corner, and select "Your Profile". You can update your personal information, contact details, and preferences there.'
    },
    {
      category: 'Account Management',
      question: 'Is my data secure?',
      answer: 'Yes, we take data security very seriously. All data is encrypted, and we follow industry-standard security practices. Read our Privacy Policy for detailed information on how we protect your data.'
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickLinks = [
    { icon: <FileText className="h-6 w-6" />, title: 'Getting Started', description: 'Learn the basics', category: 'Getting Started' },
    { icon: <CreditCard className="h-6 w-6" />, title: 'Orders & Payments', description: 'Billing information', category: 'Orders & Payments' },
    { icon: <Settings className="h-6 w-6" />, title: 'Account Settings', description: 'Manage your account', category: 'Account Management' },
    { icon: <HelpCircle className="h-6 w-6" />, title: 'Services', description: 'About our offerings', category: 'Services' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B2545] to-[#1a365d] text-white py-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-gray-300 mb-8">How can we help you today?</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C2A8] shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Quick Links */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSearchQuery(link.category)}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 text-left"
                >
                  <div className="bg-gradient-to-br from-[#00C2A8]/10 to-[#0066FF]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-[#00C2A8]">
                    {link.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Frequently Asked Questions'}
          </h2>

          {categories.map((category) => {
            const categoryFAQs = filteredFAQs.filter(faq => faq.category === category);
            if (categoryFAQs.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="h-1 w-8 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] rounded-full mr-3"></div>
                  {category}
                </h3>
                <div className="space-y-4">
                  {categoryFAQs.map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq);
                    const isOpen = openIndex === globalIndex;

                    return (
                      <motion.div
                        key={globalIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 pb-4"
                          >
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 mt-2">Try different keywords or browse by category</p>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <MessageCircle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Us
            </a>
            <a
              href="tel:+918208776319"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
