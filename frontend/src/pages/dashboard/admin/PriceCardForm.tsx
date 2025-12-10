import { useState, useEffect } from "react";
import type { PriceCard } from '../../../api/pricecards';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import {
  FiDollarSign,
  FiPackage,
  FiGrid
} from 'react-icons/fi';

type PriceCardFormProps = {
  initial?: Partial<PriceCard>;
  services: Array<{ id: number; title: string; department?: number }>;
  onSaved: () => void;
};

export default function PriceCardForm({ initial, services, onSaved }: PriceCardFormProps) {
  const [form, setForm] = useState<Partial<PriceCard>>({
    title: 'basic',
    department: undefined, // 🔥 FIX
    service: undefined,
    price: '0',
    revisions: 1,
    delivery_days: 1,
    is_active: true,
    features: [],
    ...initial,
  });

  const [saving, setSaving] = useState(false);

  // ✅ AUTO SET DEPARTMENT WHEN SERVICE CHANGES
  useEffect(() => {
    if (form.service) {
      const selectedService = services.find(s => s.id === form.service);
      if (selectedService?.department) {
        setForm(prev => ({
          ...prev,
          department: selectedService.department
        }));
      }
    }
  }, [form.service, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { createPriceCard, updatePriceCard } = await import('../../../api/pricecards');

      if (!form.department) {
        alert("Department is required. Please re-select service.");
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title,
        department: form.department, // ✅ FIXED
        service: form.service,
        price: form.price?.toString(),
        revisions: form.revisions,
        delivery_days: form.delivery_days,
        features: form.features,
        is_active: form.is_active,
      };

      if (form.id) {
        await updatePriceCard(form.id, payload);
      } else {
        await createPriceCard(payload);
      }

      onSaved();
    } catch (err: any) {
      console.error('Error saving price card:', err);
      alert(err?.response?.data || 'Failed to save price card');
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

      {/* ✅ PLAN */}
      <div>
        <label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiGrid /> Plan Type *
        </label>
        <select
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value as any })}
          className="w-full border p-3 rounded"
          required
        >
          <option value="basic">Basic</option>
          <option value="medium">Medium</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* ✅ SERVICE */}
      <div>
        <label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiPackage /> Service *
        </label>
        <select
          value={form.service || ''}
          onChange={e => setForm({ ...form, service: Number(e.target.value) })}
          className="w-full border p-3 rounded"
          required
        >
          <option value="">Select a service</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ PRICE */}
      <div>
        <label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiDollarSign /> Price (₹) *
        </label>
        <Input
          type="number"
          min="0"
          value={form.price || ''}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
        />
      </div>

      {/* ✅ REVISIONS */}
      <Input
        type="number"
        label="Revisions"
        value={form.revisions || 1}
        onChange={e => setForm({ ...form, revisions: Number(e.target.value) })}
        required
      />

      {/* ✅ DELIVERY */}
      <Input
        type="number"
        label="Delivery Days"
        value={form.delivery_days || 1}
        onChange={e => setForm({ ...form, delivery_days: Number(e.target.value) })}
        required
      />

      {/* ✅ FEATURES */}
      <div>
        <label className="block text-sm font-semibold mb-2">Features</label>
        {(form.features || []).map((feature, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              className="w-full border p-2 rounded"
              value={feature}
              onChange={e => handleFeaturesChange(index, e.target.value)}
            />
            <button type="button" onClick={() => removeFeature(index)}>❌</button>
          </div>
        ))}
        <button type="button" onClick={addFeature} className="text-blue-600">+ Add Feature</button>
      </div>

      {/* ✅ ACTIVE */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={() => setForm({ ...form, is_active: !form.is_active })}
        />
        Active
      </label>

      {/* ✅ SUBMIT */}
      <Button type="submit" isLoading={saving} className="w-full">
        {form.id ? 'Update Price Card' : 'Create Price Card'}
      </Button>
    </form>
  );
}
