import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, Scale, CreditCard, Shield, Users, Gavel } from 'lucide-react';

export default function TermsOfService() {
  const sections = [
    {
      icon: <Users className="h-6 w-6" />,
      title: '1. Acceptance of Terms',
      content: [
        {
          subtitle: 'Agreement to Terms',
          text: 'By accessing and using UdyogWorks services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
        },
        {
          subtitle: 'Eligibility',
          text: 'You must be at least 18 years old and have the legal capacity to enter into contracts to use our services. By using our services, you represent that you meet these requirements.'
        },
        {
          subtitle: 'Account Registration',
          text: 'You must provide accurate, current, and complete information during registration and keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials.'
        }
      ]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: '2. Services Description',
      content: [
        {
          subtitle: 'Service Offerings',
          text: 'UdyogWorks provides digital services including web development, mobile app development, UI/UX design, branding, and business consulting. Specific deliverables and timelines are outlined in individual project agreements.'
        },
        {
          subtitle: 'Service Modifications',
          text: 'We reserve the right to modify, suspend, or discontinue any aspect of our services at any time. We will provide reasonable notice of significant changes that may affect your active projects.'
        },
        {
          subtitle: 'Custom Solutions',
          text: 'Custom project requirements, deliverables, and timelines will be documented in separate project agreements that supplement these Terms of Service.'
        }
      ]
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: '3. Payment Terms',
      content: [
        {
          subtitle: 'Pricing',
          text: 'All prices are listed in Indian Rupees (INR) unless otherwise specified. Prices are subject to change, but changes will not affect orders already placed.'
        },
        {
          subtitle: 'Payment Schedule',
          text: 'Payment terms vary by project. Typically, we require an initial deposit before work begins, with the balance due upon project completion or according to agreed milestones.'
        },
        {
          subtitle: 'Late Payments',
          text: 'Late payments may result in project delays or suspension of services. Interest may be charged on overdue amounts at the rate of 1.5% per month or the maximum rate permitted by law, whichever is lower.'
        },
        {
          subtitle: 'Refund Policy',
          text: 'Refunds are available within 24 hours of order placement if work has not commenced. Partial refunds may be considered for work in progress, calculated based on completed milestones. Completed work is non-refundable.'
        }
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: '4. Intellectual Property Rights',
      content: [
        {
          subtitle: 'Client Ownership',
          text: 'Upon full payment, you own the final deliverables created specifically for your project. This includes custom designs, code, and content created by UdyogWorks for your project.'
        },
        {
          subtitle: 'UdyogWorks Property',
          text: 'We retain ownership of our proprietary tools, frameworks, templates, and methodologies used in delivering services. We also retain the right to showcase completed work in our portfolio unless otherwise agreed.'
        },
        {
          subtitle: 'Third-Party Components',
          text: 'Projects may include third-party components (libraries, frameworks, stock assets) subject to their respective licenses. You are responsible for complying with these licenses.'
        },
        {
          subtitle: 'Client Materials',
          text: 'You grant us a license to use materials you provide (logos, content, images) solely for the purpose of delivering your project.'
        }
      ]
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: '5. User Responsibilities',
      content: [
        {
          subtitle: 'Lawful Use',
          text: 'You agree to use our services only for lawful purposes and in accordance with these Terms. You will not use our services to create content that is illegal, harmful, or infringes on others\' rights.'
        },
        {
          subtitle: 'Content Accuracy',
          text: 'You are responsible for the accuracy and legality of all content, materials, and information you provide to us for your projects.'
        },
        {
          subtitle: 'Timely Feedback',
          text: 'You agree to provide timely feedback and approvals as requested. Delays in providing feedback may extend project timelines.'
        },
        {
          subtitle: 'Account Security',
          text: 'You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.'
        }
      ]
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: '6. Limitation of Liability',
      content: [
        {
          subtitle: 'Service Warranty',
          text: 'We strive to deliver high-quality services but do not guarantee that our services will be error-free or uninterrupted. Services are provided "as is" without warranties of any kind.'
        },
        {
          subtitle: 'Liability Cap',
          text: 'Our total liability for any claims arising from our services is limited to the amount you paid for the specific service giving rise to the claim.'
        },
        {
          subtitle: 'Indirect Damages',
          text: 'We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or business interruption.'
        },
        {
          subtitle: 'Third-Party Services',
          text: 'We are not responsible for the performance or availability of third-party services integrated into your project.'
        }
      ]
    },
    {
      icon: <Gavel className="h-6 w-6" />,
      title: '7. Dispute Resolution',
      content: [
        {
          subtitle: 'Governing Law',
          text: 'These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.'
        },
        {
          subtitle: 'Informal Resolution',
          text: 'We encourage you to contact us first to resolve any disputes informally. Most concerns can be resolved quickly through direct communication.'
        },
        {
          subtitle: 'Arbitration',
          text: 'If informal resolution fails, disputes will be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.'
        }
      ]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: '8. Termination',
      content: [
        {
          subtitle: 'Termination by You',
          text: 'You may terminate your account at any time by contacting us. You remain responsible for all charges incurred prior to termination.'
        },
        {
          subtitle: 'Termination by Us',
          text: 'We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.'
        },
        {
          subtitle: 'Effect of Termination',
          text: 'Upon termination, your right to use our services ceases immediately. Provisions that should survive termination (payment obligations, intellectual property rights, limitation of liability) will remain in effect.'
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
                <FileText className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-xl text-gray-300">
              Please read these terms carefully before using our services. These terms govern your use of UdyogWorks services.
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
            className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl mb-12"
          >
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and UdyogWorks 
              regarding your use of our services. Please read these Terms carefully. By using our services, you 
              acknowledge that you have read, understood, and agree to be bound by these Terms.
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

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-8"
          >
            <h3 className="font-semibold text-red-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Important Notice
            </h3>
            <p className="text-red-800 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of significant changes via email 
              or through a notice on our website. Your continued use of our services after such modifications constitutes 
              your acceptance of the updated Terms. We recommend reviewing these Terms periodically.
            </p>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-2xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-white/90 mb-6">
              If you have any questions or concerns about these Terms of Service, please contact our legal team.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
