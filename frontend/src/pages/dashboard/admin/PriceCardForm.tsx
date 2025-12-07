import { useState } from "react";
import type { PriceCard } from '../../../api/pricecards';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import {
  FiDollarSign,
  FiPackage,
  FiCalendar,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiPlus,
  FiGrid
} from 'react-icons/fi';

type PriceCardFormProps = {
  initial?: Partial<PriceCard>;
  services: Array<{ id: number; title: string }>;
  onSaved: () => void;
};

export default function PriceCardForm({ initial, services, onSaved }: PriceCardFormProps) {
  const [form, setForm] = useState<Partial<PriceCard>>({
    title: 'basic',
    department: 0,
    service: 0,
    price: '0',
    revisions: 1,
    delivery_days: 1,
    is_active: true,
    ...initial,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { createPriceCard, updatePriceCard } = await import('../../../api/pricecards');
      
      const payload = {
        ...form,
        price: form.price?.toString() || '0',
        revisions: form.revisions || 1,
        delivery_days: form.delivery_days || 1,
        features: form.features || [],
      };

      if (form.id) {
        await updatePriceCard(form.id, payload);
      } else {
        await createPriceCard(payload);
      }
      onSaved();
    } catch (err) {
      console.error('Error saving price card:', err);
      alert('Failed to save price card');
    } finally {
      setSaving(false);
    }
  };

  const handleFeaturesChange = (index: number, value: string) => {
    const features = [...(form.features || [])];
    features[index] = value;
    setForm({ ...form, features });
  };

  const addFeature = () => {
    setForm({
      ...form,
      features: [...(form.features || []), ''],
    });
  };

  const removeFeature = (index: number) => {
    const features = [...(form.features || [])];
    features.splice(index, 1);
    setForm({ ...form, features });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Plan Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiGrid />
            Plan Type *
          </label>
          <select
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value as any })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
            required
          >
            <option value="basic" className="py-2">Basic</option>
            <option value="medium" className="py-2">Medium</option>
            <option value="premium" className="py-2">Premium</option>
          </select>
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiPackage />
            Service *
          </label>
          <select
            value={form.service || ''}
            onChange={(e) => setForm({ ...form, service: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
            required
          >
            <option value="" className="text-gray-400">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id} className="py-2">
                {service.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiDollarSign />
            Price (₹) *
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            placeholder="0.00"
            className="w-full"
          />
        </div>

        {/* Revisions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiRefreshCw />
            Revisions *
          </label>
          <Input
            type="number"
            min="0"
            value={form.revisions || 1}
            onChange={(e) => setForm({ ...form, revisions: parseInt(e.target.value) || 0 })}
            required
            placeholder="1"
            className="w-full"
          />
        </div>

        {/* Delivery Days */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiCalendar />
            Delivery Days *
          </label>
          <Input
            type="number"
            min="1"
            value={form.delivery_days || 1}
            onChange={(e) => setForm({ ...form, delivery_days: parseInt(e.target.value) || 1 })}
            required
            placeholder="1"
            className="w-full"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Features
        </label>
        <div className="space-y-3">
          {(form.features || []).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeaturesChange(index, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Feature description"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            Add Feature
          </button>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price Card Status</label>
          <p className="text-sm text-gray-500">Enable or disable this price card</p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            form.is_active ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
              form.is_active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          onClick={() => onSaved()}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={saving}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : form.id ? 'Update Price Card' : 'Create Price Card'}
          {!saving && <FiCheck className="h-5 w-5" />}
        </Button>
      </div>
    </form>
  );
}