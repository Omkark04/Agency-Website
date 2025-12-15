// frontend/src/components/estimations/EstimationBuilder.tsx
import React, { useState } from 'react';
import { createEstimation } from '../../api/estimations';
import type { CostBreakdownItem, EstimationCreateData } from '../../types/estimations';
import { Plus, Trash2, Calculator, Loader2, CheckCircle } from 'lucide-react';

interface EstimationBuilderProps {
  orderId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EstimationBuilder: React.FC<EstimationBuilderProps> = ({
  orderId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<EstimationCreateData>({
    order: orderId,
    title: '',
    description: '',
    cost_breakdown: [
      { item: '', description: '', quantity: 1, rate: 0, amount: 0 },
    ],
    tax_percentage: 18,
    estimated_timeline_days: 30,
    valid_until: '',
    client_notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLineItem = () => {
    setFormData({
      ...formData,
      cost_breakdown: [
        ...formData.cost_breakdown,
        { item: '', description: '', quantity: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    const newItems = formData.cost_breakdown.filter((_, i) => i !== index);
    setFormData({ ...formData, cost_breakdown: newItems });
  };

  const updateLineItem = (index: number, field: keyof CostBreakdownItem, value: any) => {
    const newItems = [...formData.cost_breakdown];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity || 1;
      const rate = field === 'rate' ? parseFloat(value) || 0 : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }
    
    setFormData({ ...formData, cost_breakdown: newItems });
  };

  const calculateSubtotal = () => {
    return formData.cost_breakdown.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax_percentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await createEstimation(orderId, formData);
      setSuccess(true);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create estimation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900 mb-2">Estimation Created!</h3>
        <p className="text-green-700">The estimation has been created successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Create Estimation</h2>
        <p className="text-gray-600 mt-1">Prepare a detailed cost estimation for the client</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimation Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Website Development Estimation"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the project scope"
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Cost Breakdown *
          </label>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.cost_breakdown.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-lg">
              <div className="col-span-12 md:col-span-3">
                <input
                  type="text"
                  value={item.item}
                  onChange={(e) => updateLineItem(index, 'item', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Item name"
                  required
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Description"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input
                  type="number"
                  value={item.quantity || 1}
                  onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Qty"
                  min="1"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Rate"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="col-span-3 md:col-span-1 flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  {item.amount.toFixed(2)}
                </span>
              </div>
              <div className="col-span-1 md:col-span-1 flex items-center justify-end">
                {formData.cost_breakdown.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-medium text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Tax:</span>
            <input
              type="number"
              value={formData.tax_percentage}
              onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
              max="100"
              step="0.1"
            />
            <span className="ml-1 text-gray-700">%</span>
          </div>
          <span className="font-medium text-gray-900">₹{calculateTax().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span className="text-gray-900">Total:</span>
          <span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Timeline (Days) *
          </label>
          <input
            type="number"
            value={formData.estimated_timeline_days}
            onChange={(e) => setFormData({ ...formData, estimated_timeline_days: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valid Until
          </label>
          <input
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes for Client
          </label>
          <textarea
            value={formData.client_notes}
            onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes or terms for the client"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5 mr-2" />
              Create Estimation
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EstimationBuilder;
