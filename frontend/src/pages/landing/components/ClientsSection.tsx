import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../../../components/shared/SectionHeader';
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
        // Silently fail
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
    <section className="py-24 bg-white border-y border-gray-100 overflow-hidden relative">
      {/* Background visual flair */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <SectionHeader
        caption="Trusted by leaders"
        title="Empowering the World's"
        highlightedTitle="Most Innovative Teams"
        className="mb-12"
      />

      <div className="relative flex overflow-x-hidden group">
        {/* Left fade overlay */}
        <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        
        {/* Right fade overlay */}
        <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

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
              className="px-6 md:px-12 flex-shrink-0 transition-all duration-300 transform hover:scale-110"
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
