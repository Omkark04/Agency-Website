// AdminDashboard.tsx - WITH ANALYTICS
import React, { useEffect, useState } from 'react';
import { DashboardMetrics } from '../../../components/analytics/DashboardMetrics';
import { listOrders } from '../../../api/orders';
import { listUsers } from '../../../api/users';
import { listServices } from '../../../api/services';
import { listDepartments } from '../../../api/departments';
import {
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiLayers,
  FiTrendingUp,
  FiDollarSign,
  FiActivity,
  FiCalendar,
  FiArrowUpRight,
  FiBarChart2,
  FiAward,
} from 'react-icons/fi';

export const AdminDashboard: React.FC = () => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [departmentsCount, setDepartmentsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [growth, setGrowth] = useState({ orders: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [
          { data: orders },
          { data: users },
          { data: services },
          { data: departments }
        ] = await Promise.all([
          listOrders(),
          listUsers({ role: 'client' }),
          listServices(),
          listDepartments()
        ]);

        setOrdersCount(orders.length);
        setClientsCount(users.length);
        setServicesCount(services.length);
        setDepartmentsCount(departments.length);

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.price || 0), 0);
        setRevenue(totalRevenue);

        setGrowth({
          orders: 12.5,
          revenue: 8.3
        });
      } catch (err) {
        console.error('Dashboard Stats Error:', err);
      }
    })();
  }, []);

  return (
    <>
      {/* Animated Header with Gradient */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FiBarChart2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Dashboard Overview</h1>
                <p className="text-white/90 text-lg mt-1">Welcome back! Here's your business at a glance</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* NEW: Analytics Dashboard Metrics */}
      <div className="mb-8">
        <DashboardMetrics />
      </div>

      {/* Recent Orders Section - Enhanced */}
      <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <FiShoppingCart className="h-6 w-6 text-white" />
                </div>
                Recent Orders
              </h3>
              <p className="text-gray-600 mt-2">Latest customer orders and their status</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
              View All
              <FiArrowUpRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <RecentOrdersPreview />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
};

const RecentOrdersPreview = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await listOrders({ ordering: '-created_at', page_size: 5 });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'in_progress': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, idx) => (
            <div key={o.id} className="group p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:shadow-lg" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                      <FiShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-lg mb-1 truncate">{o.title}</div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xl font-black text-gray-900">{formatPrice(o.price)}</span>
                      <span className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-lg ${getStatusColor(o.status)}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                      <FiCalendar className="h-4 w-4" />
                      {new Date(o.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(o.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-all p-3 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-lg hover:shadow-blue-500/50 hover:scale-110 active:scale-95">
                    <FiArrowUpRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <FiShoppingCart className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No recent orders</h3>
          <p className="text-gray-500 text-lg">New orders will appear here</p>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;