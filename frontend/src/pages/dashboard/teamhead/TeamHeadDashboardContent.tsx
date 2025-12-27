import React, { useEffect, useState } from 'react';
import { getServiceHeadMetrics } from '../../../api/analytics';
import type { DashboardMetrics } from '../../../api/analytics';
import { useAuth } from '../../../hooks/useAuth';
import {
    FiShoppingCart,
    FiUsers,
    FiPackage,
    FiTrendingUp,
    FiDollarSign,
    FiActivity,
    FiCalendar,
    FiBarChart2,
    FiAward,
} from 'react-icons/fi';

export const TeamHeadDashboardContent: React.FC = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                console.log('🔍 TeamHead: Fetching service head metrics...');
                const data = await getServiceHeadMetrics();
                console.log('✅ TeamHead: Received metrics:', data);
                console.log('📊 Overview:', data.overview);
                console.log('🏢 Department:', data.department);
                setMetrics(data);
                setError(null);
            } catch (err: any) {
                console.error('❌ TeamHead: Failed to fetch metrics:', err);
                console.error('Error response:', err.response?.data);
                setError(err.response?.data?.error || 'Failed to load dashboard metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-red-800 font-bold text-lg mb-2">Error Loading Dashboard</h3>
                    <p className="text-red-600">{error || 'Failed to load dashboard metrics'}</p>
                </div>
            </div>
        );
    }

    const { overview, orders_by_status, recent_orders } = metrics;
    // These properties don't exist in DashboardMetrics yet, using safe defaults
    const services_performance = (metrics as any).services_performance || [];
    const department = (metrics as any).department || { title: 'Department' };

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

    const growth = { orders: 12.5, revenue: 8.3 }; // Placeholder for now

    return (
        <>
            {/* Animated Header with Department Info */}
            <div className="mb-8 animate-fade-in">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <FiBarChart2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white drop-shadow-lg">{department.title} Dashboard</h1>
                                <p className="text-white/90 text-lg mt-1">Welcome back, {user?.first_name || user?.email}! Here's your department overview</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {/* Revenue Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Total Revenue</p>
                                <p className="text-4xl font-black text-white mt-2 drop-shadow-lg">{formatPrice(overview.total_revenue)}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full">
                                        <FiTrendingUp className="h-3.5 w-3.5 text-white" />
                                        <span className="text-xs font-bold text-white">+{growth.revenue}%</span>
                                    </div>
                                    <span className="text-xs text-emerald-100">vs last month</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-colors shadow-lg">
                                <FiDollarSign className="h-8 w-8 text-white drop-shadow" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                {/* Orders Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                                <FiShoppingCart className="h-6 w-6 text-white" />
                            </div>
                            <div className="px-3 py-1 bg-blue-50 rounded-full">
                                <span className="text-xs font-bold text-blue-600">Active</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Orders</p>
                        <p className="text-4xl font-black text-gray-900">{overview.total_orders}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiTrendingUp className="h-4 w-4 text-green-500" />
                                <span className="font-semibold text-green-600">+{growth.orders}%</span>
                                <span>growth</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clients Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                                <FiUsers className="h-6 w-6 text-white" />
                            </div>
                            <div className="px-3 py-1 bg-purple-50 rounded-full">
                                <span className="text-xs font-bold text-purple-600">Active</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Active Clients</p>
                        <p className="text-4xl font-black text-gray-900">{overview.active_clients}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiUsers className="h-4 w-4 text-purple-500" />
                                <span>Department clients</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Members Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                                <FiPackage className="h-6 w-6 text-white" />
                            </div>
                            <div className="px-3 py-1 bg-orange-50 rounded-full">
                                <span className="text-xs font-bold text-orange-600">Team</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Team Members</p>
                        <p className="text-4xl font-black text-gray-900">{(overview as any).team_members || 0}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiPackage className="h-4 w-4 text-orange-500" />
                                <span>In department</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders by Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiActivity className="text-blue-500" />
                        Orders by Status
                    </h3>
                    <div className="space-y-4">
                        {orders_by_status.map((item) => (
                            <div key={item.status}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700 capitalize">
                                        {item.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm font-black text-gray-900">{item.count}</span>
                                </div>
                                <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full shadow-lg"
                                        style={{ width: `${(item.count / overview.total_orders) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services Performance */}
                <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiAward className="text-green-500" />
                        Top Services
                    </h3>
                    <div className="space-y-4">
                        {services_performance.slice(0, 5).map((service) => (
                            <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{service.title}</p>
                                    <p className="text-xs text-gray-500">{service.total_orders} orders</p>
                                </div>
                                <span className="font-black text-gray-900">{formatPrice(service.total_revenue || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
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
                            <p className="text-gray-600 mt-2">Latest orders in your department</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {recent_orders.map((order) => (
                            <div key={order.id} className="group p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative">
                                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                                                <FiShoppingCart className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 text-lg mb-1 truncate">{order.title}</div>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className="text-xl font-black text-gray-900">{formatPrice(order.price)}</span>
                                                <span className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-lg ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                                                <FiCalendar className="h-4 w-4" />
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {recent_orders.length === 0 && (
                        <div className="text-center py-20">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                <FiShoppingCart className="text-4xl text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No recent orders</h3>
                            <p className="text-gray-500 text-lg">New orders will appear here</p>
                        </div>
                    )}
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

export default TeamHeadDashboardContent;
