import api from '../api';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  title: string;
  status: string;
  price: number;
  created_at: string;
}

const OrderDetail: React.FC<{ orderId: string; onClose: () => void; onUpdated: () => void; }> = ({ orderId, onClose, onUpdated }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.get(`/orders/${orderId}/`).then(res => {
      setOrder(res.data);
      setEditTitle(res.data.title);
      setEditPrice(res.data.price.toString());
    }).finally(() => setLoading(false));
  }, [orderId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.patch(`/orders/${orderId}/`, {
        title: editTitle,
        price: parseFloat(editPrice),
      });
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update order');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this order?')) return;
    await api.delete(`/orders/${orderId}/`);
    onClose();
    onUpdated();
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">Order Detail</h2>
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <input className="border rounded px-3 py-2 w-full" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" type="number" min="0" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
            {editError && <div className="text-red-600 text-sm">{editError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-2"><strong>Title:</strong> {order.title}</div>
            <div className="mb-2"><strong>Status:</strong> {order.status}</div>
            <div className="mb-2"><strong>Price:</strong> ${order.price}</div>
            <div className="mb-2"><strong>Created:</strong> {new Date(order.created_at).toLocaleDateString()}</div>
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

export default OrderDetail;
