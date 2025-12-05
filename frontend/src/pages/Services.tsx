import React from 'react';

import api from '../api';
import { useEffect, useState } from 'react';
import ServiceDetail from './ServiceDetail';

interface Service {
  id: string;
  title: string;
  short_desc: string;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<string | null>(null);

  const fetchServices = () => {
    setLoading(true);
    api.get('/services/')
      .then(res => setServices(res.data))
      .catch(() => setError('Failed to load services'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) return <div>Loading services...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Available Services</h2>
      {services.length === 0 ? (
        <div className="text-gray-500">No services found.</div>
      ) : (
        <ul>
          {services.map(service => (
            <li key={service.id} className="mb-4 border-b pb-2 cursor-pointer" onClick={() => setSelected(service.id)}>
              <div className="font-semibold">{service.title}</div>
              <div className="text-gray-600 text-sm">{service.short_desc}</div>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <ServiceDetail
          serviceId={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchServices}
        />
      )}
    </div>
  );
};

export default Services;
