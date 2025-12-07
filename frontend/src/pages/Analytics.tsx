import api from '../api/api';
import { useEffect, useState } from 'react';

interface Stats {
  users: number;
  active_users: number;
  orders: number;
  revenue: number;
  services: number;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats/')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <div>No analytics data.</div>;

  return (
    <div className="bg-white rounded shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-6">Admin Analytics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-2xl font-bold">{stats.users}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <div className="text-2xl font-bold">{stats.active_users}</div>
          <div className="text-gray-600">Active Users</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded">
          <div className="text-2xl font-bold">{stats.orders}</div>
          <div className="text-gray-600">Total Orders</div>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
          <div className="text-gray-600">Total Revenue</div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <div className="text-lg font-semibold mb-2">Services: {stats.services}</div>
        {/* More charts/graphs can be added here using Chart.js */}
        <div className="text-gray-400 text-sm">(Charts and trends coming soon)</div>
      </div>
    </div>
  );
};

export default Analytics;
