import { useEffect, useState } from 'react';
import { listClientLogos, deleteClientLogo, ClientLogo } from '../../../api/clientLogos';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { FiImage, FiEdit2, FiTrash2, FiPlus, FiLink, FiToggleLeft, FiToggleRight, FiLayout } from 'react-icons/fi';
import ClientLogoForm from './ClientLogoForm';

export default function ClientsManagement() {
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ClientLogo | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listClientLogos();
      setClients(res.data);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const onEdit = (c: ClientLogo) => { setEditing(c); setOpenForm(true); };
  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client logo?')) return;
    await deleteClientLogo(id);
    load();
  };

  const filteredClients = clients.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'active') return c.is_active;
    return !c.is_active;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.is_active).length,
    inactive: clients.filter(c => !c.is_active).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <FiLayout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients & Logos</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage showcasing logos for the landing page</p>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }} className="whitespace-nowrap flex items-center gap-2">
          <FiPlus /> Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Clients</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                <FiToggleRight className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Inactive</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex border ${filter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>All Clients</button>
        <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex border ${filter === 'active' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Active</button>
        <button onClick={() => setFilter('inactive')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex border ${filter === 'inactive' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Inactive</button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <FiImage className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No clients found</h3>
          <p className="text-gray-500 mb-6">Create your first client logo to showcase on the landing page</p>
          <Button onClick={() => { setEditing(null); setOpenForm(true); }} className="flex mx-auto items-center gap-2 font-semibold">
            <FiPlus /> Add Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group">
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-center items-center relative aspect-[4/3]">
                {client.logo ? (
                  <img src={client.logo} alt={client.caption} className="max-w-[80%] max-h-[80%] object-contain" />
                ) : (
                  <FiImage className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                )}
                
                {/* Status Badge */}
                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${client.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{client.caption}</h3>
                
                {client.site_link ? (
                    <a href={client.site_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 truncate hover:underline">
                        <FiLink className="flex-shrink-0" /> {new URL(client.site_link).hostname}
                    </a>
                ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500 mt-1 block">No website link</span>
                )}
              </div>

               <div className="px-4 pb-4 flex gap-2">
                 <button onClick={() => onEdit(client)} className="flex-1 py-2 flex justify-center items-center gap-1 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                     <FiEdit2 /> Edit
                 </button>
                 <button onClick={() => onDelete(client.id)} className="w-10 py-2 flex justify-center items-center rounded-lg text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                     <FiTrash2 />
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? 'Edit Client' : 'Add Client'}>
        <ClientLogoForm initial={editing} onSaved={() => { setOpenForm(false); load(); }} />
      </Modal>
    </div>
  );
}
