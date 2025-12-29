// ============================================
// Orders.tsx - Enhanced
// ============================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../../../api/orders';
import { listSubmissions } from '../../../api/forms';
import { useAuth } from '../../../hooks/useAuth';
import { NoDepartmentMessage } from '../../../components/dashboard/NoDepartmentMessage';
import {
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiCalendar,
  FiPackage,
  FiFileText,
  FiDownload,
  FiX,
  FiEye,
  FiSettings,
  FiPhone,
  FiImage
} from 'react-icons/fi';

export default function Orders() {
  const { user } = useAuth();
  const isServiceHeadWithoutDept = user?.role === 'service_head' && !(user as any).department;
  const [orders, setOrders] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'regular' | 'form'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Add department filter for service_head users
      const params: any = {};
      if (user?.role === 'service_head' && (user as any).department) {
        const dept = (user as any).department;
        params.service__department = typeof dept === 'object' ? dept.id : dept;
      }
      
      const [ordersRes, submissionsRes] = await Promise.all([
        listOrders(params),
        listSubmissions().catch(() => ({ data: [] }))
      ]);
      
      // Ensure orders is always an array
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : ((ordersRes.data as any)?.results || []);
      
      setOrders(ordersData);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error('Orders.tsx: Failed to load orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!isServiceHeadWithoutDept && user) {
      loadOrders(); 
    }
  }, [user?.role, (user as any)?.department?.id]); // Only re-run if role or department ID changes

  // Helper functions - MUST be before early return
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

  const getSubmissionForOrder = (orderId: number) => {
    return submissions.find(sub => sub.order_id === orderId);
  };

  // Early return AFTER helper functions
  if (isServiceHeadWithoutDept) {
    return <NoDepartmentMessage />;
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(search.toLowerCase()) ||
                         (order.client_email && order.client_email.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || order.status === filter;
    
    const hasSubmission = getSubmissionForOrder(order.id);
    const matchesSource = sourceFilter === 'all' || 
                         (sourceFilter === 'form' && hasSubmission) ||
                         (sourceFilter === 'regular' && !hasSubmission);
    
    return matchesSearch && matchesFilter && matchesSource;
  });

  const stats = {
    total: orders.length,
    revenue: orders.reduce((sum, order) => sum + (parseFloat(order.total_paid) || 0), 0),
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
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Sources' },
            { key: 'regular', label: 'Regular', icon: FiShoppingCart },
            { key: 'form', label: 'Form Submissions', icon: FiFileText }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setSourceFilter(btn.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                sourceFilter === btn.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn.icon && <btn.icon className="h-4 w-4" />}
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
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Source</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Created Date</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const submission = getSubmissionForOrder(order.id);
                    return (
                    <tr key={order.id} className="group hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-rose-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl shadow-lg">
                            <FiPackage className="h-6 w-6 text-white" />
                          </div>
                          <div className="space-y-2">
                            <div className="font-bold text-gray-900 text-lg">{order.title}</div>
                            
                            {/* Client Email */}
                            {order.client_email && (
                              <div className="text-sm text-gray-600">{order.client_email}</div>
                            )}
                            
                            {/* WhatsApp Number */}
                            {order.whatsapp_number && (
                              <div className="flex items-center text-sm text-green-600">
                                <FiPhone className="h-4 w-4 mr-1" />
                                {order.whatsapp_number}
                              </div>
                            )}
                            
                            {/* Price Plan Badge */}
                            {order.price_card_title && (
                              <div className="inline-block">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  Plan: {order.price_card_title} (₹{order.price_card_price})
                                </span>
                              </div>
                            )}
                            
                            {/* Form Submission Indicator */}
                            {submission && (
                              <div className="text-xs text-indigo-600 mt-1 font-medium">
                                📋 {submission.submission_summary}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {submission ? (
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            <FiFileText className="h-3 w-3" />
                            Form
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            <FiShoppingCart className="h-3 w-3" />
                            Regular
                          </span>
                        )}
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
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/dashboard/orders/${order.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
                          >
                            <FiSettings className="h-4 w-4" />
                            Manage
                          </Link>
                          
                          {/* Show media count if form has files */}
                          {order.form_submission_data?.files && Object.keys(order.form_submission_data.files).length > 0 && (
                            <button
                              onClick={() => setSelectedSubmission(order.form_submission_data)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
                            >
                              <FiImage className="h-4 w-4" />
                              {Object.keys(order.form_submission_data.files).length} Files
                            </button>
                          )}
                          
                          {submission && (
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <FiEye className="h-4 w-4" />
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )})}
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

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Form Submission Details
              </h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Form</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedSubmission.form_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedSubmission.service_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Submitted By</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedSubmission.submitted_by_name || selectedSubmission.client_email || 'Guest'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Price Card Section - Show if price_card_id exists in data */}
              {selectedSubmission.data?.price_card_id && (() => {
                const order = orders.find(o => o.id === selectedSubmission.order_id);
                if (order?.price_card_title) {
                  return (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <FiDollarSign className="h-5 w-5 text-blue-600" />
                        Selected Price Plan
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{order.price_card_title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Plan ID: {selectedSubmission.data.price_card_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{order.price_card_price?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Total Price</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Submission Data</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                  {Object.entries(selectedSubmission.data || {}).map(([key, value]: [string, any]) => {
                    // Get field label from form_fields mapping
                    const fieldLabel = selectedSubmission.form_fields?.[key]?.label || `Field ${key}`;
                    const fieldType = selectedSubmission.form_fields?.[key]?.type;
                    
                    // Skip rendering file fields and price_card_id (they're shown separately)
                    if (fieldType === 'file' || key === 'price_card_id') return null;
                    
                    return (
                      <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{fieldLabel}</p>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded Files Section */}
              {(() => {
                const hasFiles = selectedSubmission.files && Object.keys(selectedSubmission.files).length > 0;
                const fileEntries = hasFiles ? Object.entries(selectedSubmission.files) : [];
                
                if (!hasFiles) return null;
                
                return (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Uploaded Files</h3>
                    <div className="space-y-4">
                      {fileEntries.map(([fieldId, urls]: [string, any]) => {
                        const fieldLabel = selectedSubmission.form_fields?.[fieldId]?.label || `Field ${fieldId}`;
                        const urlArray = Array.isArray(urls) ? urls : [urls];
                        return (
                          <div key={fieldId} className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{fieldLabel}</p>
                            <div className="grid grid-cols-2 gap-3">
                              {urlArray.filter(Boolean).map((url, index) => {
                                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                                if (isImage) {
                                  return (
                                    <a
                                      key={index}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                                    >
                                      <img src={url} alt={`Upload ${index + 1}`} className="w-full h-auto" />
                                    </a>
                                  );
                                } else {
                                  return (
                                    <a
                                      key={index}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                      <FiDownload className="h-4 w-4" />
                                      <span className="text-sm font-medium truncate">{url.split('/').pop() || `File ${index + 1}`}</span>
                                    </a>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

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