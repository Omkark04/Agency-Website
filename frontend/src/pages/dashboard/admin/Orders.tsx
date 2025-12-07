// ============================================
// Orders.tsx - Enhanced
// ============================================
import { useEffect, useState } from 'react';
import { listOrders } from '../../../api/orders';
import { useAuth } from '../../../hooks/useAuth';
import {
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiCalendar,
  FiPackage
} from 'react-icons/fi';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');
  useAuth();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await listOrders();
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadOrders(); 
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'in_progress': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="h-4 w-4" />;
      case 'pending': return <FiClock className="h-4 w-4" />;
      case 'in_progress': return <FiTrendingUp className="h-4 w-4" />;
      default: return <FiClock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    revenue: orders.reduce((sum, order) => sum + (order.price || 0), 0),
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-rose-600 to-pink-600 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9Im9yZGVycyIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjb3JkZXJzKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <FiShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">Orders</h1>
              <p className="text-white/90 text-lg mt-1">Manage and track customer orders</p>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
        {[
          { label: 'Total Orders', value: stats.total, icon: FiShoppingCart, color: 'from-blue-500 to-indigo-600', bg: 'from-blue-500/10 to-indigo-500/10' },
          { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: FiDollarSign, color: 'from-green-500 to-emerald-600', bg: 'from-green-500/10 to-emerald-500/10' },
          { label: 'Completed', value: stats.completed, icon: FiCheckCircle, color: 'from-purple-500 to-pink-600', bg: 'from-purple-500/10 to-pink-500/10' },
          { label: 'Pending', value: stats.pending, icon: FiClock, color: 'from-yellow-500 to-orange-600', bg: 'from-yellow-500/10 to-orange-500/10' }
        ].map((stat, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bg} rounded-full blur-2xl`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              placeholder="Search orders by title..."
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'All', color: 'from-orange-600 to-rose-600' },
            { key: 'pending', label: 'Pending', color: 'from-yellow-600 to-orange-600', icon: FiClock },
            { key: 'in_progress', label: 'In Progress', color: 'from-blue-600 to-indigo-600', icon: FiTrendingUp },
            { key: 'completed', label: 'Completed', color: 'from-green-600 to-emerald-600', icon: FiCheckCircle }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key as any)}
              className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
                filter === btn.key
                  ? `bg-gradient-to-r ${btn.color} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              {btn.icon && <btn.icon className="h-5 w-5" />}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-orange-400 opacity-20"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-orange-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Order Details</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-rose-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl shadow-lg">
                            <FiPackage className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{order.title}</div>
                            {order.description && (
                              <div className="text-sm text-gray-500 mt-1 truncate max-w-md">
                                {order.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.status)}
                          <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-2xl text-gray-900">
                          {formatPrice(order.price)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <FiCalendar className="h-5 w-5" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredOrders.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="mx-auto w-28 h-28 bg-gradient-to-br from-orange-100 to-rose-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <FiShoppingCart className="text-5xl text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders found</h3>
                <p className="text-gray-500 text-lg">
                  {search || filter !== 'all' ? 'Try adjusting your search or filter' : 'No orders have been placed yet'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}} />
    </div>
  );
}

export default Orders;