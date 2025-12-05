import React from 'react';

import api from '../api';
import { useEffect, useState } from 'react';
import OrderDetail from './OrderDetail';

interface Order {
  id: string;
  title: string;
  status: string;
  price: number;
  created_at: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/')
      .then(res => setOrders(res.data))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const [newOrder, setNewOrder] = useState({ title: '', price: '', details: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/orders/', {
        title: newOrder.title,
        price: parseFloat(newOrder.price),
        details: newOrder.details,
        status: 'pending',
      });
      setNewOrder({ title: '', price: '', details: '' });
      // Refresh orders
      setLoading(true);
      const res = await api.get('/orders/');
      setOrders(res.data);
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>
      <form className="mb-6" onSubmit={handleCreate}>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Order title"
            value={newOrder.title}
            onChange={e => setNewOrder({ ...newOrder, title: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2 w-32"
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
            value={newOrder.price}
            onChange={e => setNewOrder({ ...newOrder, price: e.target.value })}
            required
          />
        </div>
        <textarea
          className="border rounded px-3 py-2 mt-2 w-full"
          placeholder="Details (optional)"
          value={newOrder.details}
          onChange={e => setNewOrder({ ...newOrder, details: e.target.value })}
        />
        {createError && <div className="text-red-600 text-sm mt-1">{createError}</div>}
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Order'}
        </button>
      </form>
      {orders.length === 0 ? (
        <div className="text-gray-500">No orders found.</div>
      ) : (
        <table className="min-w-full">
          <thead>
            <tr className="text-left border-b">
              <th>Title</th>
              <th>Status</th>
              <th>Price</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(order.id)}>
                <td>{order.title}</td>
                <td>{order.status}</td>
                <td>${order.price}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <OrderDetail
          orderId={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchOrders}
        />
      )}
    </div>
  );
};

export default Orders;
