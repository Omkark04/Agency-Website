import { useEffect, useState } from 'react';
import { listServices, deleteService } from '../../../api/services';
import Modal from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';
import ServiceForm from './ServiceForm';
const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const load = async () => {
    const res = await listServices();
    setServices(res.data);
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    await deleteService(id);
    load();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
        <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="admin" 
        />
      <div className="flex-1">
        <Header 
          title="Services" 
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
        />
        <main className="p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">Services</h1>
            <Button onClick={() => { setEdit(null); setOpen(true); }}>Create Service</Button>
          </div>

          <div className="bg-white rounded shadow overflow-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{s.title}</td>
                    <td className="p-3">{s.department}</td>
                    <td className="p-3">{s.is_active ? 'Active' : 'Disabled'}</td>
                    <td className="p-3 space-x-2">
                      <Button size="sm" onClick={() => { setEdit(s); setOpen(true); }}>Edit</Button>
                      <Button size="sm" onClick={() => onDelete(s.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Service Form">
        <ServiceForm 
          initial={edit} 
          onSaved={() => { 
            setOpen(false); 
            load(); 
          }} 
        />
      </Modal>
    </div>
  );
};

export default Services;