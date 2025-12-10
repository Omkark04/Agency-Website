import { useState } from 'react';
import { 
  FiGift, 
  FiCalendar, 
  FiTag, 
  FiLink, 
  FiPercent,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiImage
} from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import { createOffer, updateOffer, type SpecialOffer } from '../../../api/offers';

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
    valid_from: new Date().toISOString().slice(0, 16),
    valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: true,
    is_featured: false,
    is_limited_time: false,
    conditions: [],
    features: [],
    icon_name: 'FiTag',
    button_text: 'Claim Offer',
    button_url: '',
    gradient_colors: 'from-red-500 to-orange-500',
    order_index: 0,
    ...initial,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.title?.trim()) newErrors.title = 'Title is required';
    if (!form.description?.trim()) newErrors.description = 'Description is required';
    if (form.discount_percentage === undefined || form.discount_percentage < 0 || form.discount_percentage > 100) {
      newErrors.discount_percentage = 'Discount must be between 0 and 100';
    }
    if (!form.valid_from) newErrors.valid_from = 'Start date is required';
    if (!form.valid_to) newErrors.valid_to = 'End date is required';
    if (form.valid_from && form.valid_to && new Date(form.valid_from) >= new Date(form.valid_to)) {
      newErrors.valid_to = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    setSaving(true);
    setErrors({});

    try {
        // Format dates to ISO string
        const formattedData: any = {
            title: form.title,
            description: form.description,
            short_description: form.short_description || '',
            discount_percentage: Number(form.discount_percentage),
            discount_code: form.discount_code || '',
            valid_from: new Date(form.valid_from!).toISOString(),
            valid_until: new Date(form.valid_to!).toISOString(),
            is_active: form.is_active,
            is_featured: form.is_featured,
            is_limited_time: form.is_limited_time,
            icon_name: form.icon_name,
            gradient_colors: form.gradient_colors,
            button_text: form.button_text || 'Claim Offer',
            button_url: form.button_url || '',
            order_index: form.order_index || 0,
            features: form.features || [],
            conditions: form.conditions || [],
        };

        console.log('Submitting offer data:', formattedData);

        if (form.id) {
            await updateOffer(form.id, formattedData);
        } else {
            await createOffer(formattedData);
        }
        
        onSaved();
    } catch (error: any) {
        console.error('Error saving offer:', error);
        
        // Handle validation errors from backend
        if (error.response?.data) {
            const backendErrors = error.response.data;
            
            // Convert backend errors to form errors
            const errorMessages: Record<string, string> = {};
            
            Object.keys(backendErrors).forEach(key => {
                if (Array.isArray(backendErrors[key])) {
                    errorMessages[key] = backendErrors[key].join(', ');
                } else {
                    errorMessages[key] = backendErrors[key];
                }
            });
            
            setErrors(errorMessages);
            
            // Show specific error message
            const firstError = Object.values(errorMessages)[0];
            if (firstError) {
                alert(`Error: ${firstError}`);
            }
        } else if (error.message) {
            alert(`Error: ${error.message}`);
        } else {
            alert('Failed to save offer. Please check your connection and try again.');
        }
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
    { value: 'from-purple-500 to-pink-500', label: 'Purple to Pink' },
    { value: 'from-cyan-500 to-blue-500', label: 'Cyan to Blue' },
  ];

  // Icon options
  const iconOptions = [
    { value: 'FiTag', label: 'Tag', icon: FiTag },
    { value: 'FiStar', label: 'Star', icon: FiStar },
    { value: 'FiGift', label: 'Gift', icon: FiGift },
    { value: 'FiClock', label: 'Clock', icon: FiClock },
    { value: 'FiPercent', label: 'Percent', icon: FiPercent },
    { value: 'FiCheckCircle', label: 'Check', icon: FiCheckCircle },
    { value: 'FiImage', label: 'Image', icon: FiImage },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1 max-h-[80vh] overflow-y-auto pr-2">
      {/* Title & Description */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiTag /> Offer Title *
          </label>
          <input
            type="text"
            value={form.title || ''}
            onChange={e => {
              setForm({ ...form, title: e.target.value });
              if (errors.title) setErrors({...errors, title: ''});
            }}
            required
            placeholder="Enter offer title"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 block">Short Description</label>
          <input
            type="text"
            value={form.short_description || ''}
            onChange={e => setForm({ ...form, short_description: e.target.value })}
            placeholder="Brief description for cards (max 500 characters)"
            maxLength={500}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 block">Full Description *</label>
          <textarea
            value={form.description || ''}
            onChange={e => {
              setForm({ ...form, description: e.target.value });
              if (errors.description) setErrors({...errors, description: ''});
            }}
            required
            rows={4}
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Detailed description of the offer..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
              step="0.01"
              value={form.discount_percentage || 0}
              onChange={e => {
                const value = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                setForm({ ...form, discount_percentage: value });
                if (errors.discount_percentage) setErrors({...errors, discount_percentage: ''});
              }}
              required
              className={`w-full border rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.discount_percentage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          {errors.discount_percentage && <p className="text-red-500 text-sm mt-1">{errors.discount_percentage}</p>}
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiGift /> Discount Code (Optional)
          </label>
          <input
            type="text"
            value={form.discount_code || ''}
            onChange={e => setForm({ ...form, discount_code: e.target.value.toUpperCase() })}
            placeholder="e.g., SUMMER25"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            value={form.valid_from || ''}
            onChange={e => {
              setForm({ ...form, valid_from: e.target.value });
              if (errors.valid_from) setErrors({...errors, valid_from: ''});
            }}
            required
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.valid_from ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.valid_from && <p className="text-red-500 text-sm mt-1">{errors.valid_from}</p>}
        </div>
        
        <div className="relative">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiCalendar /> Valid Until *
          </label>
          <input
            type="datetime-local"
            value={form.valid_to || ''}
            onChange={e => {
              setForm({ ...form, valid_to: e.target.value });
              if (errors.valid_to) setErrors({...errors, valid_to: ''});
            }}
            required
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.valid_to ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.valid_to && <p className="text-red-500 text-sm mt-1">{errors.valid_to}</p>}
        </div>
      </div>

      {/* Icon Selection */}
      <div>
        <label className="text-sm font-semibold mb-2 block">Select Icon</label>
        <div className="grid grid-cols-4 gap-3">
          {iconOptions.map((iconOption) => {
            const Icon = iconOption.icon;
            return (
              <button
                type="button"
                key={iconOption.value}
                onClick={() => setForm({ ...form, icon_name: iconOption.value })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  form.icon_name === iconOption.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-xs">{iconOption.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold block">Features</label>
          <span className="text-xs text-gray-500">List what customers get</span>
        </div>
        {(form.features || []).map((feature, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={feature}
              onChange={e => handleArrayChange('features', index, e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-3"
              placeholder="Add a feature..."
            />
            <button
              type="button"
              onClick={() => removeArrayItem('features', index)}
              className="px-4 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('features')}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          + Add Feature
        </button>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold block">Conditions (Optional)</label>
          <span className="text-xs text-gray-500">Terms and restrictions</span>
        </div>
        {(form.conditions || []).map((condition, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={condition}
              onChange={e => handleArrayChange('conditions', index, e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-3"
              placeholder="Add a condition..."
            />
            <button
              type="button"
              onClick={() => removeArrayItem('conditions', index)}
              className="px-4 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('conditions')}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
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
            placeholder="e.g., Claim Offer, Get Deal, Learn More"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiLink /> Button URL (Optional)
          </label>
          <input
            type="url"
            value={form.button_url || ''}
            onChange={e => setForm({ ...form, button_url: e.target.value })}
            placeholder="https://example.com/offer"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Appearance & Settings */}
      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold mb-2 block">Gradient Colors</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gradientOptions.map(option => (
              <button
                type="button"
                key={option.value}
                onClick={() => setForm({ ...form, gradient_colors: option.value })}
                className={`h-16 rounded-lg border-2 transition-all relative ${
                  form.gradient_colors === option.value
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${option.value} rounded-lg`}></div>
                {form.gradient_colors === option.value && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <FiCheckCircle className="text-white w-6 h-6" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <select
            value={form.gradient_colors}
            onChange={e => setForm({ ...form, gradient_colors: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-3"
          >
            {gradientOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={`flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
            form.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}>
            <input
              type="checkbox"
              checked={form.is_active || false}
              onChange={() => setForm({ ...form, is_active: !form.is_active })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium flex items-center gap-2">
                <FiStar className="w-4 h-4" />
                Active
              </div>
              <div className="text-sm text-gray-500">Show on website</div>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
            form.is_featured ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
          }`}>
            <input
              type="checkbox"
              checked={form.is_featured || false}
              onChange={() => setForm({ ...form, is_featured: !form.is_featured })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium flex items-center gap-2">
                <FiStar className="w-4 h-4" />
                Featured
              </div>
              <div className="text-sm text-gray-500">Highlight this offer</div>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
            form.is_limited_time ? 'border-red-500 bg-red-50' : 'border-gray-200'
          }`}>
            <input
              type="checkbox"
              checked={form.is_limited_time || false}
              onChange={() => setForm({ ...form, is_limited_time: !form.is_limited_time })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                Limited Time
              </div>
              <div className="text-sm text-gray-500">Show countdown timer</div>
            </div>
          </label>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Order Index</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={form.order_index || 0}
              onChange={e => setForm({ ...form, order_index: Number(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={form.order_index || 0}
              onChange={e => setForm({ ...form, order_index: Number(e.target.value) })}
              className="w-24 border border-gray-300 rounded-lg p-2 text-center"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Lower numbers appear first (0 = highest priority)</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t">
        <Button
          type="submit"
          isLoading={saving}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          {form.id ? 'Update Offer' : 'Create Offer'}
        </Button>
        
        <div className="mt-4 text-sm text-gray-500">
          <p className="font-semibold mb-1">Preview:</p>
          <div className={`h-12 rounded-lg flex items-center justify-between px-4 ${form.gradient_colors}`}>
            <div className="flex items-center gap-3 text-white">
              {(() => {
                const Icon = iconOptions.find(i => i.value === form.icon_name)?.icon || FiTag;
                return <Icon className="w-5 h-5" />;
              })()}
              <span className="font-medium">{form.title || 'Offer Title'}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold">
              {form.discount_percentage || 0}% OFF
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default OffersForm;