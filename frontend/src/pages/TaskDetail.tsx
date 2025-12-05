import api from '../api';
import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: number;
  due_date: string;
  created_at: string;
}

const TaskDetail: React.FC<{ taskId: string; onClose: () => void; onUpdated: () => void; }> = ({ taskId, onClose, onUpdated }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState(2);
  const [editDue, setEditDue] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.get(`/tasks/${taskId}/`).then(res => {
      setTask(res.data);
      setEditTitle(res.data.title);
      setEditPriority(res.data.priority);
      setEditDue(res.data.due_date || '');
    }).finally(() => setLoading(false));
  }, [taskId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.patch(`/tasks/${taskId}/`, {
        title: editTitle,
        priority: editPriority,
        due_date: editDue || null,
      });
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}/`);
    onClose();
    onUpdated();
  };

  if (loading) return <div>Loading...</div>;
  if (!task) return <div>Task not found.</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">Task Detail</h2>
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <input className="border rounded px-3 py-2 w-full" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" type="number" min="1" max="5" value={editPriority} onChange={e => setEditPriority(Number(e.target.value))} />
            <input className="border rounded px-3 py-2 w-full" type="date" value={editDue} onChange={e => setEditDue(e.target.value)} />
            {editError && <div className="text-red-600 text-sm">{editError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-2"><strong>Title:</strong> {task.title}</div>
            <div className="mb-2"><strong>Status:</strong> {task.status}</div>
            <div className="mb-2"><strong>Priority:</strong> {task.priority}</div>
            <div className="mb-2"><strong>Due Date:</strong> {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</div>
            <div className="mb-2"><strong>Created:</strong> {new Date(task.created_at).toLocaleDateString()}</div>
            <div className="flex gap-2 mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setEditing(true)}>Edit</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
