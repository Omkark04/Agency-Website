import { useEffect, useState } from 'react';
import { listPriceCards, deletePriceCard } from '../../../api/pricecards';
import { listServices } from '../../../api/services';
import Modal from '../../../components/ui/Modal';
import PriceCardForm from './PriceCardForm';
import { Button } from '../../../components/ui/Button';
import { FiEdit2, FiTrash2, FiPlus, FiDollarSign, FiPackage, FiGrid } from 'react-icons/fi';

export default function PriceCards() {
  const [cards, setCards] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([listPriceCards(), listServices()]);
      setCards(r1.data);
      setServices(r2.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onEdit = (c: any) => { setEdit(c); setOpen(true); }
  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this price card?')) return;
    await deletePriceCard(id);
    load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiGrid className="text-blue-600" />
                Price Cards
              </h1>
              <p className="text-gray-600 mt-2">Manage your pricing plans and packages</p>
            </div>
            <Button 
              onClick={() => { setEdit(null); setOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <FiPlus className="text-lg" />
              Create New Card
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Cards</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{cards.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiGrid className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Services</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{services.length}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FiPackage className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Price</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{cards.length > 0 ? Math.round(cards.reduce((sum, c) => sum + parseFloat(c.price || 0), 0) / cards.length) : 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FiDollarSign className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Plan Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Features
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cards.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{c.title}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {c.delivery_days} days delivery • {c.revisions} revisions
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <FiPackage className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {c.service?.title ?? c.service}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-lg text-gray-900">
                            ₹{c.price}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {c.features?.slice(0, 2).map((f: string, i: number) => (
                              <div key={i} className="flex items-center gap-1 mb-1">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                <span className="truncate max-w-xs">{f}</span>
                              </div>
                            ))}
                            {c.features?.length > 2 && (
                              <span className="text-blue-600 text-xs">+{c.features.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onEdit(c)}
                              className="flex items-center gap-1"
                            >
                              <FiEdit2 />
                              Edit
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => onDelete(c.id)}
                              className="text-red-600 hover:bg-red-50 flex items-center gap-1"
                            >
                              <FiTrash2 />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {cards.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiDollarSign className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No price cards yet</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first price card</p>
                  <Button 
                    onClick={() => { setEdit(null); setOpen(true); }}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <FiPlus />
                    Create Price Card
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={edit ? 'Edit Price Card' : 'Create Price Card'}>
        <PriceCardForm initial={edit} services={services} onSaved={() => { setOpen(false); load(); }} />
      </Modal>
    </div>
  );
}