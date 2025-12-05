import api from '../api';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const UserDetail: React.FC<{ userId: string; onClose: () => void; onUpdated: () => void; }> = ({ userId, onClose, onUpdated }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editRole, setEditRole] = useState('client');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.get(`/users/${userId}/`).then(res => {
      setUser(res.data);
      setEditRole(res.data.role);
      setEditActive(res.data.is_active);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.patch(`/users/${userId}/`, {
        role: editRole,
        is_active: editActive,
      });
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${userId}/`);
    onClose();
    onUpdated();
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">User Detail</h2>
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <select className="border rounded px-3 py-2 w-full" value={editRole} onChange={e => setEditRole(e.target.value)}>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
              <option value="service_head">Service Head</option>
              <option value="team_member">Team Member</option>
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editActive} onChange={e => setEditActive(e.target.checked)} />
              Active
            </label>
            {editError && <div className="text-red-600 text-sm">{editError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-2"><strong>Username:</strong> {user.username}</div>
            <div className="mb-2"><strong>Email:</strong> {user.email}</div>
            <div className="mb-2"><strong>Role:</strong> {user.role}</div>
            <div className="mb-2"><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</div>
            <div className="mb-2"><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setEditing(true)}>Edit</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
