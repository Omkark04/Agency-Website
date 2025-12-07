import { useEffect, useState } from 'react';
import { listTasks } from '../../../api/tasks';
import { FiCheckCircle, FiClock, FiList, FiPlus, FiCalendar } from 'react-icons/fi';

export function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await listTasks();
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InRhc2tzIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN0YXNrcykiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <FiList className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">Tasks</h1>
                  <p className="text-white/90 text-lg mt-1">Manage and track your tasks</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-white text-green-600 hover:bg-gray-50 px-6 py-3 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all rounded-xl">
                <FiPlus className="text-xl" />
                Add New Task
              </button>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
        {[
          { label: 'Total Tasks', value: stats.total, icon: FiList, color: 'from-blue-500 to-indigo-600', bg: 'from-blue-500/10 to-indigo-500/10' },
          { label: 'Completed', value: stats.completed, icon: FiCheckCircle, color: 'from-green-500 to-emerald-600', bg: 'from-green-500/10 to-emerald-500/10' },
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

      {/* Filters */}
      <div className="flex gap-3 mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
        {[
          { key: 'all', label: 'All Tasks', color: 'from-green-600 to-emerald-600' },
          { key: 'pending', label: 'Pending', color: 'from-yellow-600 to-orange-600', icon: FiClock },
          { key: 'completed', label: 'Completed', color: 'from-green-600 to-teal-600', icon: FiCheckCircle }
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

      {/* Tasks List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-green-400 opacity-20"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {filteredTasks.map((task, idx) => (
                <div key={task.id} className="group p-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-2xl transition-all duration-300 border-2 border-transparent hover:border-green-200 hover:shadow-xl" style={{animationDelay: `${idx * 0.05}s`}}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl mt-1 shadow-lg ${
                          task.status === 'completed' 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                            : 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                        }`}>
                          {task.status === 'completed' ? (
                            <FiCheckCircle className="h-6 w-6" />
                          ) : (
                            <FiClock className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-xl mb-2">{task.title}</h3>
                          <p className="text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                          {task.due_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                              <FiCalendar className="h-4 w-4" />
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-5 py-2.5 text-sm font-bold rounded-full shadow-lg ${
                        task.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 transition-all p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 active:scale-95">
                        <FiCheckCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTasks.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="mx-auto w-28 h-28 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  {filter === 'completed' ? (
                    <FiCheckCircle className="text-5xl text-green-400" />
                  ) : filter === 'pending' ? (
                    <FiClock className="text-5xl text-yellow-400" />
                  ) : (
                    <FiList className="text-5xl text-green-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No tasks found</h3>
                <p className="text-gray-500 text-lg">
                  {filter === 'all' ? 'Create your first task to get started' :
                   filter === 'completed' ? 'No completed tasks yet' :
                   'No pending tasks at the moment'}
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

export default Tasks;