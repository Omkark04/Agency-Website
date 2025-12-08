import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Award, Shield, Users, Sparkles } from 'lucide-react';

const offers = [
  {
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    title: "Lightning Fast Delivery",
    description: "Get your project delivered in record time with our efficient workflow and dedicated team.",
    features: ["24/7 Support", "Quick Turnaround", "Priority Access"]
  },
  {
    icon: <Award className="w-8 h-8 text-amber-500" />,
    title: "Premium Quality",
    description: "Experience top-notch quality with our expert team and proven development process.",
    features: ["Expert Team", "Code Review", "Quality Assurance"]
  },
  {
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    title: "Secure & Reliable",
    description: "Your data's security is our top priority with enterprise-grade protection.",
    features: ["Data Encryption", "Regular Backups", "GDPR Compliant"]
  },
  {
    icon: <Users className="w-8 h-8 text-purple-500" />,
    title: "Dedicated Support",
    description: "Our support team is always ready to assist you with any questions or issues.",
    features: ["24/7 Support", "Dedicated Manager", "Priority Response"]
  }
];

const OfferCard = ({ offer, index }: { offer: typeof offers[0], index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
  >
    <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
      {offer.icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{offer.title}</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-4">{offer.description}</p>
    <ul className="space-y-2">
      {offer.features.map((feature, i) => (
        <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

export const Offers = () => {
  return (
    <section id="offers" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
            Our Offers
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What We Offer
          </h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover our comprehensive range of services designed to help your business grow and succeed in the digital world.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {offers.map((offer, index) => (
            <OfferCard key={index} offer={offer} index={index} />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 -mt-32 -mr-32"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Special Limited Time Offer</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Get 20% off on your first project when you sign up today! Limited time offer, don't miss out.
            </p>
            <button className="px-8 py-3 bg-white text-blue-600 font-medium rounded-full hover:bg-blue-50 transition-colors duration-300">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
