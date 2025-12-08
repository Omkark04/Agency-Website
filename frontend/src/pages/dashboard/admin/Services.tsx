import { useEffect, useState } from 'react';
import { listServices, deleteService } from '../../../api/services';
import Modal from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import ServiceForm from './ServiceForm';
import {
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiLayers,
  FiSearch,
  FiImage
} from 'react-icons/fi';

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listServices();
      setServices(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await deleteService(id);
    load();
  };

  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.title.toLowerCase().includes(search.toLowerCase()) ||
      service.department_title?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && service.is_active) ||
      (filter === 'inactive' && !service.is_active);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    inactive: services.filter(s => !s.is_active).length,
  };

  return (
    <div className="min-h-screen">

      {/* ✅ HEADER */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <FiPackage className="text-4xl" />
              <div>
                <h1 className="text-4xl font-bold">Services</h1>
                <p className="opacity-90">Manage your service offerings</p>
              </div>
            </div>

            <Button
              onClick={() => { setEdit(null); setOpen(true); }}
              className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 font-bold rounded-xl"
            >
              <FiPlus /> Create Service
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or department..."
            className="w-full pl-10 py-3 border rounded-lg"
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="border p-3 rounded-lg"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* ✅ SERVICES TABLE */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border">
        {loading ? (
          <div className="py-20 text-center">Loading...</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Logo</th>
                  <th className="p-4 text-left">Service</th>
                  <th className="p-4 text-left">Department</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map(service => (
                  <tr key={service.id} className="border-t hover:bg-gray-50">

                    {/* ✅ LOGO COLUMN */}
                    <td className="p-4">
                      {service.logo ? (
                        <img
                          src={service.logo}
                          alt={service.title}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded text-gray-500">
                          <FiImage />
                        </div>
                      )}
                    </td>

                    {/* ✅ TITLE */}
                    <td className="p-4 font-semibold">{service.title}</td>

                    {/* ✅ DEPARTMENT */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FiLayers />
                        {service.department_title || 'No department'}
                      </div>
                    </td>

                    {/* ✅ STATUS */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        service.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* ✅ ACTIONS */}
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => { setEdit(service); setOpen(true); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => onDelete(service.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                      >
                        <FiTrash2 />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {filteredServices.length === 0 && (
              <div className="py-20 text-center text-gray-500">
                No services found
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ MODAL */}
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
