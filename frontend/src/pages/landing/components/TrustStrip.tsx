// components/TrustStrip.tsx - DYNAMIC VERSION
import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaUsers, FaAward, FaRocket, FaStar, FaBriefcase } from 'react-icons/fa';
import { listFeaturedClients, getCompanyStats } from '../../../api/clients';
import type { Client, CompanyStat, CompanyStatsResponse } from '../../../api/clients';

// Icon mapping for stats
const statIconMap = {
  'chart-line': <FaChartLine className="text-2xl" />,
  'users': <FaUsers className="text-2xl" />,
  'award': <FaAward className="text-2xl" />,
  'rocket': <FaRocket className="text-2xl" />,
  'star': <FaStar className="text-2xl" />,
  'briefcase': <FaBriefcase className="text-2xl" />,
};

// Color mapping for icons
const statColorMap = {
  'chart-line': 'text-[#00C2A8]',
  'users': 'text-[#0066FF]',
  'award': 'text-[#0B2545] dark:text-[#00C2A8]',
  'rocket': 'text-[#FF6B6B]',
  'star': 'text-[#FFD700]',
  'briefcase': 'text-[#8A2BE2]',
};

export const TrustStrip = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, statsRes] = await Promise.all([
        listFeaturedClients(),
        getCompanyStats()
      ]);
      setClients(clientsRes.data);
      
      // Handle both array and object response formats
      const statsData = statsRes.data;
      if (Array.isArray(statsData)) {
        setStats(statsData.sort((a: CompanyStat, b: CompanyStat) => a.order_index - b.order_index));
      } else {
        // Convert object format to array format for display
        const data = statsData as CompanyStatsResponse;
        const statsArray: CompanyStat[] = [
          { id: 1, title: 'Projects Completed', value: String(data.total_projects || 0), icon_name: 'rocket', is_active: true, order_index: 0 },
          { id: 2, title: 'Happy Clients', value: String(data.total_clients || 0), icon_name: 'users', is_active: true, order_index: 1 },
          { id: 3, title: 'Success Rate', value: `${data.success_rate || 98}%`, icon_name: 'chart-line', is_active: true, order_index: 2 },
        ];
        setStats(statsArray);
      }
    } catch (error) {
      console.error('Error fetching trust strip data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-6"></div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Client Logos */}
        <div className="mb-12">
          <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
            Trusted by industry leaders
          </h3>
          {clients.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">
                Client logos will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 0.7, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <a 
                    href={client.website || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={client.logo_url} 
                      alt={client.name} 
                      className="h-12 w-auto object-contain max-w-[120px]"
                      loading="lazy"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'h-12 w-32 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 text-sm font-medium';
                        fallback.textContent = client.name;
                        target.parentNode?.insertBefore(fallback, target.nextSibling);
                      }}
                    />
                  </a>
                  {client.testimonial_count > 0 && (
                    <div className="flex items-center justify-center mt-2">
                      {[...Array(Math.min(client.testimonial_count, 5))].map((_, i) => (
                        <FaStar key={i} className="h-3 w-3 text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({client.testimonial_count})
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = statIconMap[stat.icon_name as keyof typeof statIconMap] || statIconMap['chart-line'];
              const iconColor = statColorMap[stat.icon_name as keyof typeof statColorMap] || 'text-[#00C2A8]';
              
              return (
                <motion.div 
                  key={stat.id}
                  className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-full ${iconColor} bg-opacity-10`}>
                      {React.cloneElement(IconComponent, { className: `text-2xl ${iconColor}` })}
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">
                    {stat.title}
                  </p>
                  {stat.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {stat.description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {clients.length > 0 && (
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Join {clients.length}+ satisfied clients who trust us with their digital transformation
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TrustStrip;