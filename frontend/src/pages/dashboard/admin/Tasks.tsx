import { useEffect, useState } from 'react';
import { listTasks } from '../../../api/tasks';
import { Sidebar } from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import { useAuth } from '../../../hooks/useAuth';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const loadTasks = async () => {
    try {
      const res = await listTasks();
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role || 'admin'}
      />
      <div className="flex-1">
        <Header 
          title="Tasks" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        <main className="p-6">
          <div className="bg-white rounded shadow overflow-hidden">
            <ul className="divide-y">
              {tasks.map(task => (
                <li key={task.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {tasks.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No tasks found
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
