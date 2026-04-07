import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { listClientLogos, ClientLogo } from '../../../api/clientLogos';
import { FiTrendingUp } from 'react-icons/fi';

export const ClientsSection = () => {
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await listClientLogos({ is_active: true });
        setClients(res.data);
      } catch (err) {
        console.error("Failed to load client logos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading || clients.length === 0) return null;

  // Duplicate clients array to ensure smooth infinite loop
  // Multiply enough times to fill ultra-wide screens
  const marqueeClients = [...clients, ...clients, ...clients, ...clients, ...clients, ...clients, ...clients];

  return (
    <section className="py-24 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 overflow-hidden relative">
      {/* Background visual flair */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4 border border-blue-100 dark:border-blue-800/50"
        >
          <FiTrendingUp /> Trusted By Industry Leaders
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white"
        >
          Empowering the World's
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mt-2">
            Most Innovative Teams
          </span>
        </motion.h2>
      </div>

      <div className="relative flex overflow-x-hidden group">
        {/* Left fade overlay */}
        <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-white to-transparent dark:from-gray-900 z-10 pointer-events-none" />
        
        {/* Right fade overlay */}
        <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-white to-transparent dark:from-gray-900 z-10 pointer-events-none" />

        {/* CSS Animation style block for marquee */}
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-scroll {
              animation: marquee 35s linear infinite;
            }
            .group:hover .animate-marquee-scroll {
              animation-play-state: paused;
            }
          `}
        </style>

        {/* Marquee Container */}
        <div 
          className="flex whitespace-nowrap animate-marquee-scroll py-4 items-center"
          ref={scrollRef}
        >
          {marqueeClients.map((client, index) => (
            <div 
              key={`client-${index}`} 
              className="px-6 md:px-12 flex-shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 transform hover:scale-110"
            >
              {client.site_link ? (
                <a href={client.site_link} target="_blank" rel="noopener noreferrer" className="block outline-none" title={client.caption}>
                    <img 
                      src={client.logo} 
                      alt={client.caption} 
                      className="h-12 md:h-16 w-auto max-w-[180px] object-contain drop-shadow-sm" 
                    />
                </a>
              ) : (
                <img 
                  src={client.logo} 
                  alt={client.caption} 
                  title={client.caption}
                  className="h-12 md:h-16 w-auto max-w-[180px] object-contain drop-shadow-sm" 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
