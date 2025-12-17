import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listOrders, type Order } from '../../../api/orders';
import { CreditCard, Eye, Calendar, DollarSign, Package } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await listOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; gradient: string; icon: string }> = {
      'pending': { 
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50', 
        text: 'text-yellow-700', 
        gradient: 'from-yellow-500 to-amber-500',
        icon: '⏳'
      },
      'approved': { 
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100', 
        text: 'text-[#1E40AF]', 
        gradient: 'from-[#2563EB] to-[#1E40AF]',
        icon: '✓'
      },
      'in_progress': { 
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100', 
        text: 'text-[#2563EB]', 
        gradient: 'from-[#2563EB] to-[#1E40AF]',
        icon: '⚡'
      },
      '25_done': { 
        bg: 'bg-gradient-to-r from-indigo-50 to-blue-50', 
        text: 'text-indigo-700', 
        gradient: 'from-indigo-500 to-blue-500',
        icon: '25%'
      },
      '50_done': { 
        bg: 'bg-gradient-to-r from-indigo-50 to-purple-50', 
        text: 'text-indigo-700', 
        gradient: 'from-indigo-500 to-purple-500',
        icon: '50%'
      },
      '75_done': { 
        bg: 'bg-gradient-to-r from-violet-50 to-purple-50', 
        text: 'text-violet-700', 
        gradient: 'from-violet-500 to-purple-500',
        icon: '75%'
      },
      'ready_for_delivery': { 
        bg: 'bg-gradient-to-r from-cyan-50 to-teal-50', 
        text: 'text-cyan-700', 
        gradient: 'from-cyan-500 to-teal-500',
        icon: '📦'
      },
      'delivered': { 
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50', 
        text: 'text-green-700', 
        gradient: 'from-green-500 to-emerald-500',
        icon: '✅'
      },
      'completed': { 
        bg: 'bg-gradient-to-r from-green-50 to-green-100', 
        text: 'text-[#15803D]', 
        gradient: 'from-[#16A34A] to-[#15803D]',
        icon: '🎉'
      },
      'closed': { 
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50', 
        text: 'text-gray-700', 
        gradient: 'from-gray-500 to-slate-500',
        icon: '🔒'
      },
      'payment_done': { 
        bg: 'bg-gradient-to-r from-green-50 to-green-100', 
        text: 'text-[#16A34A]', 
        gradient: 'from-[#16A34A] to-[#15803D]',
        icon: '💰'
      },
    };
    return colors[status] || { 
      bg: 'bg-gradient-to-r from-gray-50 to-gray-100', 
      text: 'text-gray-700', 
      gradient: 'from-gray-500 to-gray-600',
      icon: '•'
    };
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders & Payments</h1>
        <p className="text-gray-600">View and manage all your orders</p>
      </div>

      {/* Enhanced Stats - Admin Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Orders - Gradient Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Orders</p>
                <p className="text-4xl font-black text-white mt-2 drop-shadow-lg">{orders.length}</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-colors shadow-lg">
                <Package className="h-8 w-8 text-white drop-shadow" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* In Progress - Glassmorphism Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-[#1E40AF]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-2xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-purple-50 rounded-full">
                <span className="text-xs font-bold text-purple-600">Active</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">In Progress</p>
            <p className="text-4xl font-black text-gray-900">
              {orders.filter(o => o.status.includes('progress') || o.status.includes('done')).length}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4 text-purple-500" />
                <span>Active orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Completed - Glassmorphism Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-green-50 rounded-full">
                <span className="text-xs font-bold text-green-600">Done</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Completed</p>
            <p className="text-4xl font-black text-gray-900">
              {orders.filter(o => o.status === 'completed' || o.status === 'closed').length}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-green-500" />
                <span>Finished</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Spent - Glassmorphism Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#16A34A]/10 to-[#15803D]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-2xl shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-emerald-50 rounded-full">
                <span className="text-xs font-bold text-emerald-600">Total</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Spent</p>
            <p className="text-4xl font-black text-gray-900">
              ₹{orders.reduce((sum, o) => sum + (o.total_price || 0), 0).toLocaleString()}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span>All payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Orders Table - Admin Style */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">No orders found</p>
                    <p className="text-sm text-gray-500">Your orders will appear here once you place them</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConfig = getStatusColor(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.service_title || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full ${statusConfig.bg} ${statusConfig.text} shadow-sm border border-current/20`}>
                          <span className="mr-1.5">{statusConfig.icon}</span>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-emerald-600 mr-1" />
                          <span className="text-sm font-bold text-gray-900">₹{order.total_price?.toLocaleString() || '0'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <Link
                          to={`/client-dashboard/orders/${order.id}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
