import { useEffect, useState } from 'react';
import { listUsers, deleteUser } from '../../../api/users';
import { Sidebar } from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const load = async () => {
    try {
      const res = await listUsers();
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Delete user?')) return;
    try {
      await deleteUser(id);
      await load();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role || 'admin'}
      />
      <div className="flex-1">
        <Header 
          title="Users" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        <main className="p-6">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-right">
                    <Button 
                      variant="primary"
                      size="sm" 
                      onClick={() => onDelete(u.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
