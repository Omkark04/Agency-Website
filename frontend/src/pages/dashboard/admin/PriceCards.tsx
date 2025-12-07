import { useEffect, useState } from 'react';
import { listPriceCards, deletePriceCard } from '../../../api/pricecards';
import { listServices } from '../../../api/services';
import { useAuth } from '../../../hooks/useAuth';
import Modal from '../../../components/ui/Modal';
import PriceCardForm from './PriceCardForm';
import { Sidebar } from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import { Button } from '../../../components/ui/Button';

export default function PriceCards() {
  const [cards, setCards] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const load = async () => {
    const [r1, r2] = await Promise.all([listPriceCards(), listServices()]);
    setCards(r1.data);
    setServices(r2.data);
  };
  useEffect(() => { load(); }, []);

  const onEdit = (c: any) => { setEdit(c); setOpen(true); }
  const onDelete = async (id: number) => {
    if (!confirm('Delete price card?')) return;
    await deletePriceCard(id);
    load();
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role || 'admin'} 
      />
      <div className="flex-1">
        <Header 
            title="Price Cards" 
            onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
        />
        <main className="p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">Price Cards</h1>
            <Button onClick={() => { setEdit(null); setOpen(true); }}>Create</Button>
          </div>
          <div className="bg-white rounded shadow overflow-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr><th className="p-3">Plan</th><th className="p-3">Service</th><th className="p-3">Price</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody>
                {cards.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{c.title}</td>
                    <td className="p-3">{c.service?.title ?? c.service}</td>
                    <td className="p-3">₹{c.price}</td>
                    <td className="p-3">
                      <Button size="sm" onClick={() => onEdit(c)}>Edit</Button>
                      <Button size="sm" onClick={() => onDelete(c.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={edit ? 'Edit Price Card' : 'Create Price Card'}>
        <PriceCardForm initial={edit} services={services} onSaved={() => { setOpen(false); load(); }} />
      </Modal>
    </div>
  );
}
