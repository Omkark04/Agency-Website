import { useEffect, useState } from 'react';
import { listDepartments, deleteDepartment } from '../../../api/departments';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import DepartmentForm from './DepartmentForm';
import Header from '../../../components/dashboard/Header';
import Sidebar from '../../../components/dashboard/Sidebar';
import { useAuth } from '../../../hooks/useAuth';

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
    const { user } = useAuth(); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    };

  const load = async () => {
    setLoading(true);
    try {
      const res = await listDepartments();
      setDepartments(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onEdit = (d: any) => { setEditing(d); setOpenForm(true); };
  const onDelete = async (id: number) => {
    if (!confirm('Delete department?')) return;
    await deleteDepartment(id);
    load();
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        userRole={user?.role || 'admin'} // Make sure to use the correct role from your user object
        />
      <div className="flex-1">
        <Header 
            title="Departments" 
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Departments</h1>
            <Button onClick={() => { setEditing(null); setOpenForm(true); }}>Create Department</Button>
          </div>

          <div className="bg-white rounded shadow overflow-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Team Head</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{d.title}</td>
                    <td className="p-3">{d.team_head?.email ?? '—'}</td>
                    <td className="p-3">{d.is_active ? <span className="text-green-600">Active</span> : <span className="text-gray-600">Disabled</span>}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button size="sm" onClick={() => onEdit(d)}>Edit</Button>
                      <Button size="sm" onClick={() => onDelete(d.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No departments yet</td></tr>}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? 'Edit Department' : 'Create Department'}>
        <DepartmentForm initial={editing} onSaved={() => { setOpenForm(false); load(); }} />
      </Modal>
    </div>
  );
}
