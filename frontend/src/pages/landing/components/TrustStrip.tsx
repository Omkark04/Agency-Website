import { motion } from 'framer-motion';
import { FaChartLine, FaUsers, FaAward } from 'react-icons/fa';

export const TrustStrip = () => {
  // Placeholder client logos (replace with actual client logos)
  const clients = [
    { name: 'Client 1', logo: 'https://via.placeholder.com/120x60?text=Client+1' },
    { name: 'Client 2', logo: 'https://via.placeholder.com/120x60?text=Client+2' },
    { name: 'Client 3', logo: 'https://via.placeholder.com/120x60?text=Client+3' },
    { name: 'Client 4', logo: 'https://via.placeholder.com/120x60?text=Client+4' },
    { name: 'Client 5', logo: 'https://via.placeholder.com/120x60?text=Client+5' },
  ];

  const stats = [
    { 
      value: '500+', 
      label: 'Projects Completed',
      icon: <FaChartLine className="text-2xl text-[#00C2A8]" />
    },
    { 
      value: '50+', 
      label: 'Industries Served',
      icon: <FaUsers className="text-2xl text-[#0066FF]" />
    },
    { 
      value: '98%', 
      label: 'Client Satisfaction',
      icon: <FaAward className="text-2xl text-[#0B2545] dark:text-[#00C2A8]" />
    },
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Client Logos */}
        <div className="mb-12">
          <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
            Trusted by industry leaders
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                className="opacity-70 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 0.7, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img 
                  src={client.logo} 
                  alt={client.name} 
                  className="h-12 w-auto object-contain"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
