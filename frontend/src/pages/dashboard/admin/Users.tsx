import { useEffect, useState } from 'react';
import { listUsers, deleteUser } from '../../../api/users';
import { Button } from '../../../components/ui/Button';
import { 
  FiUsers, 
  FiTrash2, 
  FiMail, 
  FiKey, 
  FiCalendar,
  FiSearch,
  FiUserPlus,
  FiShield
} from 'react-icons/fi';

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'client' | 'service_head'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      await load();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
      case 'service_head': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      case 'client': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase()) ||
                         user.username?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    client: users.filter(u => u.role === 'client').length,
    service_head: users.filter(u => u.role === 'service_head').length,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InVzZXJzIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN1c2VycykiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <FiUsers className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">Users Management</h1>
                  <p className="text-white/90 text-lg mt-1">Manage system users and their roles</p>
                </div>
              </div>
              <Button className="flex items-center gap-2 bg-white text-purple-600 hover:bg-gray-50 px-6 py-3 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all rounded-xl">
                <FiUserPlus className="text-xl" />
                Add User
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
        {[
          { label: 'Total Users', value: roleCounts.all, icon: FiUsers, color: 'from-gray-500 to-slate-600', bg: 'from-gray-500/10 to-slate-500/10' },
          { label: 'Admins', value: roleCounts.admin, icon: FiShield, color: 'from-purple-500 to-pink-600', bg: 'from-purple-500/10 to-pink-500/10' },
          { label: 'Clients', value: roleCounts.client, icon: FiMail, color: 'from-green-500 to-emerald-600', bg: 'from-green-500/10 to-emerald-500/10' },
          { label: 'Service Heads', value: roleCounts.service_head, icon: FiKey, color: 'from-blue-500 to-indigo-600', bg: 'from-blue-500/10 to-indigo-500/10' }
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
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
              placeholder="Search users by email or name..."
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'All Users', color: 'from-purple-600 to-pink-600' },
            { key: 'admin', label: 'Admins', color: 'from-purple-600 to-indigo-600' },
            { key: 'client', label: 'Clients', color: 'from-green-600 to-emerald-600' },
            { key: 'service_head', label: 'Service Heads', color: 'from-blue-600 to-cyan-600' }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key as any)}
              className={`px-6 py-4 rounded-xl font-bold transition-all ${
                filter === btn.key
                  ? `bg-gradient-to-r ${btn.color} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400 opacity-20"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">User Details</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Joined Date</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{u.email}</div>
                            <div className="text-sm text-gray-500 mt-1">{u.username || 'No username'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getRoleColor(u.role)}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <FiCalendar className="h-5 w-5" />
                          {new Date(u.date_joined).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(u.id)}
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
            
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="mx-auto w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <FiUsers className="text-5xl text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No users found</h3>
                <p className="text-gray-500 text-lg mb-6">
                  {search || filter !== 'all' ? 'Try adjusting your search or filter' : 'No users in the system yet'}
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

export default Users;
