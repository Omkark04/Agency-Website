import { useState } from "react";
import type { PriceCard } from '../../../api/pricecards';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
        <select
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value as any })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="basic">Basic</option>
          <option value="medium">Medium</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
        <select
          value={form.service || ''}
          onChange={(e) => setForm({ ...form, service: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Price (₹)"
        type="number"
        min="0"
        step="0.01"
        value={form.price || ''}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />

      <Input
        label="Number of Revisions"
        type="number"
        min="0"
        value={form.revisions || 1}
        onChange={(e) => setForm({ ...form, revisions: parseInt(e.target.value) || 0 })}
        required
      />

      <Input
        label="Delivery Days"
        type="number"
        min="1"
        value={form.delivery_days || 1}
        onChange={(e) => setForm({ ...form, delivery_days: parseInt(e.target.value) || 1 })}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
        <div className="space-y-2">
          {(form.features || []).map((feature, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeaturesChange(index, e.target.value)}
                className="flex-1 rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Feature description"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Feature
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" onClick={() => onSaved()} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          {form.id ? 'Update' : 'Create'} Price Card
        </Button>
      </div>
    </form>
  );
}