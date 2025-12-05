import api from '../api';
import { useEffect, useState } from 'react';

interface Service {
  id: string;
  title: string;
  short_desc: string;
  long_desc?: string;
  created_at: string;
}

const ServiceDetail: React.FC<{ serviceId: string; onClose: () => void; onUpdated: () => void; }> = ({ serviceId, onClose, onUpdated }) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editShort, setEditShort] = useState('');
  const [editLong, setEditLong] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.get(`/services/${serviceId}/`).then(res => {
      setService(res.data);
      setEditTitle(res.data.title);
      setEditShort(res.data.short_desc || '');
      setEditLong(res.data.long_desc || '');
    }).finally(() => setLoading(false));
  }, [serviceId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.patch(`/services/${serviceId}/`, {
        title: editTitle,
        short_desc: editShort,
        long_desc: editLong,
      });
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update service');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this service?')) return;
    await api.delete(`/services/${serviceId}/`);
    onClose();
    onUpdated();
  };

  if (loading) return <div>Loading...</div>;
  if (!service) return <div>Service not found.</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">Service Detail</h2>
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <input className="border rounded px-3 py-2 w-full" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" value={editShort} onChange={e => setEditShort(e.target.value)} placeholder="Short description" />
            <textarea className="border rounded px-3 py-2 w-full" value={editLong} onChange={e => setEditLong(e.target.value)} placeholder="Long description" />
            {editError && <div className="text-red-600 text-sm">{editError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-2"><strong>Title:</strong> {service.title}</div>
            <div className="mb-2"><strong>Short Desc:</strong> {service.short_desc}</div>
            <div className="mb-2"><strong>Long Desc:</strong> {service.long_desc}</div>
            <div className="mb-2"><strong>Created:</strong> {new Date(service.created_at).toLocaleDateString()}</div>
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

export default ServiceDetail;
