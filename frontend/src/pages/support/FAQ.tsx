import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, ChevronDown, Search, Mail, Phone } from 'lucide-react';
import { SEOHead } from '../../components/shared/SEOHead';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const faqs: FAQItem[] = [
    // General
    {
      category: 'General',
      question: 'What is UdyogWorks?',
      answer: 'UdyogWorks is a comprehensive business development agency that provides digital solutions including web development, mobile apps, UI/UX design, branding, and business consulting to help businesses grow and succeed in the digital landscape.'
    },
    {
      category: 'General',
      question: 'Where are you located?',
      answer: 'Our main office is located in Mumbai, Maharashtra, India. However, we serve clients globally and work remotely with teams and clients worldwide.'
    },
    {
      category: 'General',
      question: 'Do you work with international clients?',
      answer: 'Yes! We work with clients from all over the world. We have experience collaborating across different time zones and can accommodate your schedule for meetings and communication.'
    },

    // Services
    {
      category: 'Services',
      question: 'What services do you offer?',
      answer: 'We offer a comprehensive range of services including Web Development, Mobile App Development (iOS & Android), UI/UX Design, Social Media Marketing, Branding & Identity, E-commerce Solutions, and Business Consulting.'
    },
    {
      category: 'Services',
      question: 'Can you handle both design and development?',
      answer: 'Absolutely! We provide end-to-end solutions from initial concept and design through development, testing, and deployment. Our integrated approach ensures consistency and quality throughout your project.'
    },
    {
      category: 'Services',
      question: 'Do you offer maintenance and support after project completion?',
      answer: 'Yes, we offer ongoing maintenance and support packages. This includes bug fixes, security updates, feature enhancements, and technical support to ensure your solution continues to perform optimally.'
    },
    {
      category: 'Services',
      question: 'Can you work with our existing systems?',
      answer: 'Yes, we can integrate with your existing systems, databases, and third-party services. We\'ll assess your current infrastructure and recommend the best integration approach.'
    },

    // Pricing
    {
      category: 'Pricing',
      question: 'How much do your services cost?',
      answer: 'Pricing varies based on project scope, complexity, and requirements. We provide detailed quotations after understanding your specific needs. Contact us for a free consultation and custom quote.'
    },
    {
      category: 'Pricing',
      question: 'Do you offer package deals or discounts?',
      answer: 'Yes, we offer package deals for bundled services and provide discounts for long-term partnerships and large-scale projects. Contact our sales team to discuss custom packages.'
    },
    {
      category: 'Pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, credit/debit cards, UPI, and online payment gateways. Payment terms are typically structured with an initial deposit and milestone-based payments.'
    },
    {
      category: 'Pricing',
      question: 'Is there a refund policy?',
      answer: 'Yes, we offer refunds within 24 hours of order placement if work hasn\'t started. For ongoing projects, refunds are calculated based on completed milestones. Please refer to our Terms of Service for complete details.'
    },

    // Technical Support
    {
      category: 'Technical Support',
      question: 'How long does a typical project take?',
      answer: 'Project timelines vary: simple websites take 2-4 weeks, complex web applications 2-3 months, and mobile apps 3-6 months. We provide detailed timelines during the quotation phase.'
    },
    {
      category: 'Technical Support',
      question: 'What technologies do you use?',
      answer: 'We use modern, industry-standard technologies including React, Next.js, Node.js, Python/Django, React Native, Flutter, and cloud platforms like AWS and Azure. We choose technologies based on your specific requirements.'
    },
    {
      category: 'Technical Support',
      question: 'Will I own the source code?',
      answer: 'Yes, upon full payment, you own all custom code and designs created specifically for your project. We retain rights to our proprietary frameworks and tools used in development.'
    },
    {
      category: 'Technical Support',
      question: 'How do you ensure quality?',
      answer: 'We follow rigorous quality assurance processes including code reviews, automated testing, manual testing, and user acceptance testing. We also provide staging environments for you to review before launch.'
    },
    {
      category: 'Technical Support',
      question: 'Do you provide training?',
      answer: 'Yes, we provide comprehensive training for your team on how to use and manage the solutions we deliver. This includes documentation, video tutorials, and live training sessions.'
    },
    {
      category: 'Technical Support',
      question: 'What happens if something breaks after launch?',
      answer: 'We provide a warranty period (typically 30-90 days) for bug fixes after launch. For ongoing support, we offer maintenance packages to ensure your solution stays up-to-date and functional.'
    }
  ];

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SEOHead 
        title="Frequently Asked Questions"
        description="Find answers to common questions about UdyogWorks' services, pricing, technical support, and more."
        url="/faq"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">Find answers to common questions about our services</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C2A8] shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => {
              const globalIndex = faqs.indexOf(faq);
              const isOpen = openIndex === globalIndex;

              return (
                <motion.div
                  key={globalIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                    className="w-full px-6 py-5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 pr-4">
                      <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${
                        isOpen 
                          ? 'bg-gradient-to-br from-[#00C2A8] to-[#0066FF] text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {faq.category}
                        </span>
                      </div>
                    </div>
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
                      className="px-6 pb-5 pl-20"
                    >
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No FAQs found matching your search</p>
              <p className="text-gray-500 mt-2">Try different keywords or browse by category</p>
            </div>
          )}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-2xl p-8 md:p-12 text-white text-center"
          >
            <HelpCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is ready to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:udyogworks.official@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </a>
              <a
                href="tel:+918390498423"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                <Phone className="h-5 w-5 mr-2" />
                +91 83904 98423
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
