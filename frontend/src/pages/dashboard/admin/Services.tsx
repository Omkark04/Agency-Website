import { useEffect, useState } from 'react';
import { listServices, deleteService } from '../../../api/services';
import Modal from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import ServiceForm from './ServiceForm';
import {
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiLayers,
  FiToggleLeft,
  FiToggleRight,
  FiSearch
} from 'react-icons/fi';

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listServices();
      setServices(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await deleteService(id);
    load();
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(search.toLowerCase()) ||
                         service.department?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && service.is_active) ||
                         (filter === 'inactive' && !service.is_active);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    inactive: services.filter(s => !s.is_active).length,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InNlcnZpY2VzIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjI4IiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NlcnZpY2VzKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <FiPackage className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">Services</h1>
                  <p className="text-white/90 text-lg mt-1">Manage your service offerings</p>
                </div>
              </div>
              <Button 
                onClick={() => { setEdit(null); setOpen(true); }}
                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all rounded-xl"
              >
                <FiPlus className="text-xl" />
                Create Service
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
        {[
          { label: 'Total Services', value: stats.total, icon: FiPackage, color: 'from-blue-500 to-cyan-600', bg: 'from-blue-500/10 to-cyan-500/10' },
          { label: 'Active', value: stats.active, icon: FiToggleRight, color: 'from-green-500 to-emerald-600', bg: 'from-green-500/10 to-emerald-500/10', badge: 'Active' },
          { label: 'Inactive', value: stats.inactive, icon: FiToggleLeft, color: 'from-gray-500 to-slate-600', bg: 'from-gray-500/10 to-slate-500/10', badge: 'Inactive' }
        ].map((stat, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bg} rounded-full blur-2xl`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
                {stat.badge && (
                  <div className={`px-3 py-1 rounded-full border-2 ${
                    stat.badge === 'Active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}>
                    <span className="text-xs font-bold">{stat.badge}</span>
                  </div>
                )}
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
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              placeholder="Search services by name or department..."
            />
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { key: 'all', label: 'All Services', color: 'from-blue-600 to-cyan-600' },
            { key: 'active', label: 'Active Only', color: 'from-green-600 to-emerald-600', icon: FiToggleRight },
            { key: 'inactive', label: 'Inactive Only', color: 'from-gray-600 to-slate-600', icon: FiToggleLeft }
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
              {btn.icon && <btn.icon />}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Service Details</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Department</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredServices.map(s => (
                    <tr key={s.id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                            <FiPackage className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{s.title}</div>
                            <div className="text-sm text-gray-500 mt-1 truncate max-w-md">
                              {s.short_description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                            <FiLayers className="text-gray-600 h-5 w-5" />
                          </div>
                          <span className="font-bold text-gray-900">
                            {s.department || 'No department'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                          s.is_active 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { setEdit(s); setOpen(true); }}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <FiEdit2 />
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(s.id)}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredServices.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <FiPackage className="text-5xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
                <p className="text-gray-500 text-lg mb-6">
                  {search || filter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first service to get started'}
                </p>
                <Button 
                  onClick={() => { setEdit(null); setOpen(true); }}
                  className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-lg font-bold shadow-xl"
                >
                  <FiPlus />
                  Create Service
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Service Form">
        <ServiceForm 
          initial={edit} 
          onSaved={() => { 
            setOpen(false); 
            load(); 
          }} 
        />
      </Modal>

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
};

export default Services;