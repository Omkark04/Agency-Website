import api from '../api';
import { useEffect, useState } from 'react';
import UserDetail from './UserDetail';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users/')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      {users.length === 0 ? (
        <div className="text-gray-500">No users found.</div>
      ) : (
        <table className="min-w-full">
          <thead>
            <tr className="text-left border-b">
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(user.id)}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <UserDetail
          userId={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
};

export default Users;
