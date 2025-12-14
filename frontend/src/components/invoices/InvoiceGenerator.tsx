// frontend/src/components/invoices/InvoiceGenerator.tsx
import React, { useState } from 'react';
import { generateInvoice } from '../../api/invoices';
import { LineItem, InvoiceGenerateData } from '../../types/invoices';
import { Plus, Trash2, FileText, Loader2, CheckCircle } from 'lucide-react';

interface InvoiceGeneratorProps {
  orderId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  orderId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<InvoiceGenerateData>({
    order_id: orderId,
    title: '',
    line_items: [
      { item: '', description: '', quantity: 1, rate: 0, amount: 0 },
    ],
    tax_percentage: 18,
    discount_amount: 0,
    due_date: '',
    notes: '',
    terms_and_conditions: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [
        ...formData.line_items,
        { item: '', description: '', quantity: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    const newItems = formData.line_items.filter((_, i) => i !== index);
    setFormData({ ...formData, line_items: newItems });
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...formData.line_items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity || 1;
      const rate = field === 'rate' ? parseFloat(value) || 0 : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }
    
    setFormData({ ...formData, line_items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.line_items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax_percentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - formData.discount_amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await generateInvoice(orderId, formData);
      setSuccess(true);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900 mb-2">Invoice Generated!</h3>
        <p className="text-green-700">The invoice has been created and sent to the client.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Generate Invoice</h2>
        <p className="text-gray-600 mt-1">Create a professional invoice for the client</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Invoice Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Website Development Invoice"
          required
        />
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Line Items *
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
          {formData.line_items.map((item, index) => (
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
                {formData.line_items.length > 1 && (
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
      <div className="bg-red-50 rounded-lg p-4 space-y-2">
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
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-700">Discount:</span>
          <input
            type="number"
            value={formData.discount_amount}
            onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span className="text-gray-900">Total:</span>
          <span className="text-red-600">₹{calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date
        </label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Terms & Conditions
          </label>
          <textarea
            value={formData.terms_and_conditions}
            onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Payment terms, late fees, etc."
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
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Generate Invoice
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InvoiceGenerator;
