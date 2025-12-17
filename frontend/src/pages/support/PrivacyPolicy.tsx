import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, Database, Cookie, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <Database className="h-6 w-6" />,
      title: '1. Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect information you provide directly to us, including your name, email address, phone number, company name, and any other information you choose to provide when creating an account or placing an order.'
        },
        {
          subtitle: 'Usage Information',
          text: 'We automatically collect certain information about your device and how you interact with our services, including IP address, browser type, operating system, pages visited, and time spent on pages.'
        },
        {
          subtitle: 'Payment Information',
          text: 'Payment information is processed securely through our third-party payment processors. We do not store complete credit card information on our servers.'
        }
      ]
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: '2. How We Use Your Information',
      content: [
        {
          subtitle: 'Service Delivery',
          text: 'We use your information to provide, maintain, and improve our services, process your orders, and communicate with you about your projects.'
        },
        {
          subtitle: 'Communication',
          text: 'We may send you service-related emails, updates about your orders, and promotional materials (which you can opt out of at any time).'
        },
        {
          subtitle: 'Analytics and Improvement',
          text: 'We analyze usage patterns to improve our services, develop new features, and enhance user experience.'
        }
      ]
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: '3. Data Protection and Security',
      content: [
        {
          subtitle: 'Security Measures',
          text: 'We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.'
        },
        {
          subtitle: 'Access Controls',
          text: 'Access to personal information is restricted to authorized personnel who need it to perform their job functions.'
        },
        {
          subtitle: 'Data Breach Protocol',
          text: 'In the event of a data breach, we will notify affected users within 72 hours and take immediate steps to mitigate any potential harm.'
        }
      ]
    },
    {
      icon: <Cookie className="h-6 w-6" />,
      title: '4. Cookies and Tracking Technologies',
      content: [
        {
          subtitle: 'Essential Cookies',
          text: 'We use essential cookies to enable core functionality such as user authentication and session management.'
        },
        {
          subtitle: 'Analytics Cookies',
          text: 'We use analytics cookies to understand how visitors interact with our website, helping us improve our services.'
        },
        {
          subtitle: 'Cookie Management',
          text: 'You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.'
        }
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: '5. Third-Party Services',
      content: [
        {
          subtitle: 'Service Providers',
          text: 'We work with trusted third-party service providers for payment processing, email delivery, and analytics. These providers are contractually obligated to protect your data.'
        },
        {
          subtitle: 'Data Sharing',
          text: 'We do not sell, rent, or trade your personal information to third parties for marketing purposes. We only share data as necessary to provide our services or as required by law.'
        }
      ]
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: '6. Your Rights and Choices',
      content: [
        {
          subtitle: 'Access and Correction',
          text: 'You have the right to access, update, or correct your personal information at any time through your account settings.'
        },
        {
          subtitle: 'Data Deletion',
          text: 'You can request deletion of your account and associated data by contacting our support team. Some information may be retained as required by law.'
        },
        {
          subtitle: 'Marketing Opt-Out',
          text: 'You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or updating your preferences in your account.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You have the right to request a copy of your data in a portable format.'
        }
      ]
    }
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
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-xl text-gray-300">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last Updated: December 17, 2025
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-12"
          >
            <p className="text-gray-700 leading-relaxed">
              At UdyogWorks, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our services.
              By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </motion.div>

          {/* Sections */}
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-[#00C2A8]/10 to-[#0066FF]/10 p-3 rounded-xl text-[#00C2A8]">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="space-y-6 pl-0 md:pl-14">
                {section.content.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-2xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Questions About Our Privacy Policy?</h2>
            <p className="text-white/90 mb-6">
              If you have any questions or concerns about this Privacy Policy or our data practices, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:privacy@udyogworks.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                privacy@udyogworks.com
              </a>
              <a
                href="/#contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Contact Support
              </a>
            </div>
          </motion.div>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Note:</strong> We reserve the right to update this Privacy Policy at any time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this 
              Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
