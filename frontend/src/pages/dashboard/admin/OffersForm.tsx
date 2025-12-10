// components/offers/OffersForm.tsx
import { useState } from 'react';
import { FiGift, FiUpload, FiX, FiImage, FiCalendar, FiTag, FiLink, FiPercent } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import type { SpecialOffer } from '../../../api/offers';

interface OffersFormProps {
  initial?: Partial<SpecialOffer>;
  onSaved: () => void;
}

const OffersForm = ({ initial, onSaved }: OffersFormProps) => {
  const [form, setForm] = useState<Partial<SpecialOffer>>({
    title: '',
    description: '',
    short_description: '',
    discount_percentage: 0,
    discount_code: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    is_featured: false,
    is_limited_time: false,
    conditions: [],
    features: [],
    button_text: 'Claim Offer',
    button_url: '',
    gradient_colors: 'from-red-500 to-orange-500',
    order_index: 0,
    ...initial,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Handle file selection
  const handleFileChange = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // File handling temporarily disabled until backend supports image uploads
    console.log('File selection temporarily disabled');
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    // TODO: Implement image removal when backend supports it
  };

  // Handle array field changes
  const handleArrayChange = (field: 'conditions' | 'features', index: number, value: string) => {
    const items = [...(form[field] || [])];
    items[index] = value;
    setForm({ ...form, [field]: items });
  };

  const addArrayItem = (field: 'conditions' | 'features') => {
    setForm({
      ...form,
      [field]: [...(form[field] || []), ''],
    });
  };

  const removeArrayItem = (field: 'conditions' | 'features', index: number) => {
    const items = [...(form[field] || [])];
    items.splice(index, 1);
    setForm({ ...form, [field]: items });
  };

  // Handle form submission
  const handleSubmit = async (_e: React.FormEvent) => {
    setSaving(true);

    try {
      // TODO: Implement API calls when backend is ready
      console.log('Form data:', form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSaved();
    } catch (error: any) {
      console.error('Error saving offer:', error);
      alert(error?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  // Gradient color options
  const gradientOptions = [
    { value: 'from-red-500 to-orange-500', label: 'Red to Orange' },
    { value: 'from-blue-500 to-purple-500', label: 'Blue to Purple' },
    { value: 'from-green-500 to-teal-500', label: 'Green to Teal' },
    { value: 'from-pink-500 to-rose-500', label: 'Pink to Rose' },
    { value: 'from-yellow-500 to-amber-500', label: 'Yellow to Amber' },
    { value: 'from-indigo-500 to-blue-500', label: 'Indigo to Blue' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1 max-h-[80vh] overflow-y-auto">
      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiImage /> Offer Image *
        </label>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative inline-block mb-4">
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Offer preview"
                className="w-64 h-64 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="relative">
          <input
            id="offer-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled
          />
          <label
            htmlFor="offer-image-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-2xl cursor-pointer transition-all bg-gray-100 border-gray-300 text-gray-500"
          >
            <FiUpload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">
              Image upload temporarily disabled
            </p>
            <p className="text-gray-500 text-sm mt-1">Icon name will be used instead</p>
          </label>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiTag /> Offer Title *
          </label>
          <input
            type="text"
            value={form.title || ''}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Enter offer title"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 block">Short Description</label>
          <input
            type="text"
            value={form.short_description || ''}
            onChange={e => setForm({ ...form, short_description: e.target.value })}
            placeholder="Brief description for cards"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 block">Full Description *</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed description of the offer..."
          />
        </div>
      </div>

      {/* Discount & Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiPercent /> Discount Percentage *
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={form.discount_percentage || 0}
              onChange={e => setForm({ ...form, discount_percentage: Number(e.target.value) })}
              required
              className="w-full border rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiGift /> Discount Code (Optional)
          </label>
          <input
            type="text"
            value={form.discount_code || ''}
            onChange={e => setForm({ ...form, discount_code: e.target.value })}
            placeholder="e.g., SUMMER25"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Validity Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiCalendar /> Valid From *
          </label>
          <input
            type="datetime-local"
            value={form.valid_from ? new Date(form.valid_from).toISOString().slice(0, 16) : ''}
            onChange={e => setForm({ ...form, valid_from: e.target.value })}
            required
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="relative">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiCalendar /> Valid Until *
          </label>
          <input
            type="datetime-local"
            value={form.valid_until ? new Date(form.valid_until).toISOString().slice(0, 16) : ''}
            onChange={e => setForm({ ...form, valid_until: e.target.value })}
            required
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <label className="text-sm font-semibold mb-2 block">Features</label>
        {(form.features || []).map((feature, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={feature}
              onChange={e => handleArrayChange('features', index, e.target.value)}
              className="flex-1 border rounded-lg p-3"
              placeholder="Add a feature..."
            />
            <button
              type="button"
              onClick={() => removeArrayItem('features', index)}
              className="px-4 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('features')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Feature
        </button>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <label className="text-sm font-semibold mb-2 block">Conditions (Optional)</label>
        {(form.conditions || []).map((condition, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={condition}
              onChange={e => handleArrayChange('conditions', index, e.target.value)}
              className="flex-1 border rounded-lg p-3"
              placeholder="Add a condition..."
            />
            <button
              type="button"
              onClick={() => removeArrayItem('conditions', index)}
              className="px-4 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('conditions')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Condition
        </button>
      </div>

      {/* Button & URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiTag /> Button Text
          </label>
          <input
            type="text"
            value={form.button_text || 'Claim Offer'}
            onChange={e => setForm({ ...form, button_text: e.target.value })}
            placeholder="e.g., Claim Offer"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiLink /> Button URL (Optional)
          </label>
          <input
            type="text"
            value={form.button_url || ''}
            onChange={e => setForm({ ...form, button_url: e.target.value })}
            placeholder="https://example.com/offer"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Appearance & Settings */}
      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold mb-2 block">Gradient Colors</label>
          <select
            value={form.gradient_colors}
            onChange={e => setForm({ ...form, gradient_colors: e.target.value })}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {gradientOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active || false}
              onChange={() => setForm({ ...form, is_active: !form.is_active })}
              className="w-5 h-5 text-blue-600"
            />
            <div>
              <div className="font-medium">Active</div>
              <div className="text-sm text-gray-500">Show on website</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured || false}
              onChange={() => setForm({ ...form, is_featured: !form.is_featured })}
              className="w-5 h-5 text-blue-600"
            />
            <div>
              <div className="font-medium">Featured</div>
              <div className="text-sm text-gray-500">Highlight this offer</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_limited_time || false}
              onChange={() => setForm({ ...form, is_limited_time: !form.is_limited_time })}
              className="w-5 h-5 text-blue-600"
            />
            <div>
              <div className="font-medium">Limited Time</div>
              <div className="text-sm text-gray-500">Show countdown timer</div>
            </div>
          </label>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Order Index</label>
          <input
            type="number"
            value={form.order_index || 0}
            onChange={e => setForm({ ...form, order_index: Number(e.target.value) })}
            placeholder="0"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        isLoading={saving}
        disabled={saving}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl"
      >
        {form.id ? 'Update Offer' : 'Create Offer'}
      </Button>
    </form>
  );
};

export default OffersForm;