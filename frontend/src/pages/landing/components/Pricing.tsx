import { motion } from 'framer-motion';
import { Check, Zap, Star } from 'lucide-react';

export const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$499',
      description: 'Perfect for small businesses getting started',
      features: [
        '5 Social Media Designs',
        '1 Website Page',
        'Basic SEO Setup',
        'Email Support',
        '1 Revision Round'
      ],
      popular: false,
      gradient: 'from-gray-500 to-gray-700',
      cta: 'Get Started',
    },
    {
      name: 'Growth',
      price: '$1,299',
      description: 'Ideal for growing businesses',
      features: [
        '15 Social Media Designs',
        '5 Website Pages',
        'Advanced SEO',
        'Priority Support',
        '3 Revision Rounds',
        'Basic Analytics',
        'Monthly Report'
      ],
      popular: true,
      gradient: 'from-[#00C2A8] to-[#0066FF]',
      cta: 'Choose Growth',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large scale business solutions',
      features: [
        'Unlimited Designs',
        'Custom Web Application',
        'Dedicated Team',
        '24/7 Support',
        'Unlimited Revisions',
        'Advanced Analytics',
        'Monthly Strategy Calls',
        'Performance Reports'
      ],
      popular: false,
      gradient: 'from-[#0B2545] to-[#1a365d]',
      cta: 'Contact Sales',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan that fits your business needs. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'transform -translate-y-2' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              
              <div className="bg-white dark:bg-gray-800 p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <div className="text-4xl font-bold mb-1">{plan.price}</div>
                  {plan.name !== 'Enterprise' && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">per month</span>
                  )}
                </div>
                
                <button 
                  className={`w-full mb-8 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-all duration-300`}
                >
                  {plan.cta}
                </button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {plan.popular && (
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 rounded-full p-2">
                  <Star className="h-5 w-5" fill="currentColor" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Need a custom solution? We've got you covered.
          </p>
          <button className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white rounded-lg font-semibold transition-all duration-300 flex items-center mx-auto">
            <Zap className="h-5 w-5 mr-2" />
            Get a Custom Quote
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
