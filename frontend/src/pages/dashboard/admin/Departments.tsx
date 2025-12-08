import { useEffect, useState } from 'react';
import { listDepartments, deleteDepartment } from '../../../api/departments';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import DepartmentForm from './DepartmentForm';
import { 
  FiLayers, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiUsers,
  FiToggleLeft,
  FiToggleRight,
  FiActivity
} from 'react-icons/fi';

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listDepartments();
      setDepartments(res.data);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const onEdit = (d: any) => { setEditing(d); setOpenForm(true); };
  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    await deleteDepartment(id);
    load();
  };

  const filteredDepartments = departments.filter(dept => {
    if (filter === 'all') return true;
    if (filter === 'active') return dept.is_active;
    return !dept.is_active;
  });

  const stats = {
    total: departments.length,
    active: departments.filter(d => d.is_active).length,
    inactive: departments.filter(d => !d.is_active).length,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImxheWVycyIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDMwIDAgTCAwIDIwIDAgNDAgMzAgNjAgNjAgNDAgNjAgMjAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2xheWVycykiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <FiLayers className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">Departments</h1>
                  <p className="text-white/90 text-lg mt-1">Manage your organization's departments</p>
                </div>
              </div>
              <Button 
                onClick={() => { setEditing(null); setOpenForm(true); }}
                className="text-black flex items-center gap-2 bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all rounded-xl"
              >
                <FiPlus className="text-black text-xl" />
                Create Department
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-indigo-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg">
                <FiLayers className="text-white text-2xl" />
              </div>
              <FiActivity className="text-indigo-500 text-xl" />
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Total Departments</p>
            <p className="text-4xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-green-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FiToggleRight className="text-white text-2xl" />
              </div>
              <div className="px-3 py-1 bg-green-50 rounded-full border border-green-200">
                <span className="text-xs font-bold text-green-700">Active</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Active</p>
            <p className="text-4xl font-black text-gray-900">{stats.active}</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl shadow-lg">
                <FiToggleLeft className="text-white text-2xl" />
              </div>
              <div className="px-3 py-1 bg-gray-100 rounded-full border border-gray-300">
                <span className="text-xs font-bold text-gray-700">Inactive</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Inactive</p>
            <p className="text-4xl font-black text-gray-900">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
            filter === 'all'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <FiLayers />
          All Departments
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
            filter === 'active'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <FiToggleRight />
          Active Only
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
            filter === 'inactive'
              ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <FiToggleLeft />
          Inactive Only
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-indigo-400 opacity-20"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-indigo-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Department Details
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Team Head
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDepartments.map(d => (
                    <tr key={d.id} className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-blue-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {d.logo ? (
                            <img 
                              src={d.logo} 
                              alt={d.title} 
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-200 group-hover:border-indigo-300 shadow-sm group-hover:shadow-md transition-all"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <FiLayers className="h-7 w-7 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-lg mb-1">{d.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {d.short_description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                            <FiUsers className="text-blue-600 h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {d.team_head?.username || d.team_head?.email || 'Not assigned'}
                            </div>
                            {d.team_head?.email && (
                              <div className="text-sm text-gray-500">{d.team_head.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                          d.is_active 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {d.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onEdit(d)}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <FiEdit2 />
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(d.id)}
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
            
            {filteredDepartments.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="mx-auto w-28 h-28 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <FiLayers className="text-5xl text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No departments found</h3>
                <p className="text-gray-500 text-lg mb-6">
                  {filter === 'all' ? 'Create your first department to get started' :
                   filter === 'active' ? 'No active departments' :
                   'No inactive departments'}
                </p>
                <Button 
                  onClick={() => { setEditing(null); setOpenForm(true); }}
                  className="flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-lg font-bold shadow-xl"
                >
                  <FiPlus />
                  Create Department
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? 'Edit Department' : 'Create Department'}>
        <DepartmentForm initial={editing} onSaved={() => { setOpenForm(false); load(); }} />
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}} />;
    </div>
  );
};