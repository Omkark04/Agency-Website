import { useEffect, useState } from 'react';
import { listPortfolios, deletePortfolio } from '../../../api/portfolio';
import Modal from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import PortfolioForm from './PortfolioForm';
import { FiBriefcase, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Portfolio() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await listPortfolios();
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Delete this portfolio?')) return;
    await deletePortfolio(id);
    load();
  };

  return (
    <div className="min-h-screen">

      {/* ✅ HEADER */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-xl flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <FiBriefcase className="text-4xl"/>
            <div>
              <h1 className="text-4xl font-bold">Portfolio</h1>
              <p className="opacity-90">Manage your projects</p>
            </div>
          </div>
          <Button onClick={() => { setEdit(null); setOpen(true); }} className="bg-white text-purple-700">
            <FiPlus /> Add Portfolio
          </Button>
        </div>
      </div>

      {/* ✅ CARDS */}
      {loading ? <div className="text-center py-20">Loading...</div> : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(p => (
            <div key={p.id} className="bg-white border rounded-xl overflow-hidden shadow hover:shadow-xl transition">
              <img src={p.featured_image} className="h-48 w-full object-cover" />

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.client_name}</p>
                <p className="text-xs text-gray-400">{p.service_title}</p>

                <div className="flex gap-2 pt-3">
                  <button onClick={() => { setEdit(p); setOpen(true); }} className="bg-blue-600 text-white p-2 rounded">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => onDelete(p.id)} className="bg-red-600 text-white p-2 rounded">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Portfolio Form">
        <PortfolioForm initial={edit} onSaved={() => { setOpen(false); load(); }} />
      </Modal>
    </div>
  );
}
