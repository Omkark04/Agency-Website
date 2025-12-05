import api from '../api';
import { useEffect, useState } from 'react';
import TaskDetail from './TaskDetail';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: number;
  due_date: string;
  created_at: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', priority: 2, due_date: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [selected, setSelected] = useState<string | null>(null);

  const fetchTasks = () => {
    setLoading(true);
    api.get('/tasks/')
      .then(res => setTasks(res.data))
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/tasks/', {
        title: newTask.title,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        status: 'todo',
      });
      setNewTask({ title: '', priority: 2, due_date: '' });
      setLoading(true);
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
      <form className="mb-6" onSubmit={handleCreate}>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Task title"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2 w-32"
            placeholder="Priority (1-5)"
            type="number"
            min="1"
            max="5"
            value={newTask.priority}
            onChange={e => setNewTask({ ...newTask, priority: Number(e.target.value) })}
            required
          />
          <input
            className="border rounded px-3 py-2 w-40"
            type="date"
            value={newTask.due_date}
            onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
          />
        </div>
        {createError && <div className="text-red-600 text-sm mt-1">{createError}</div>}
        <button
          type="submit"
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Task'}
        </button>
      </form>
      {tasks.length === 0 ? (
        <div className="text-gray-500">No tasks found.</div>
      ) : (
        <table className="min-w-full">
          <thead>
            <tr className="text-left border-b">
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(task.id)}>
                <td>{task.title}</td>
                <td>{task.status}</td>
                <td>{task.priority}</td>
                <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                <td>{new Date(task.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <TaskDetail
          taskId={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchTasks}
        />
      )}
    </div>
  );
};

export default Tasks;
