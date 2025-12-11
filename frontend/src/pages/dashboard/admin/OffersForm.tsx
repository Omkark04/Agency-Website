import { useState, useEffect, useRef } from 'react';
import { 
  FiGift, 
  FiCalendar, 
  FiTag, 
  FiLink, 
  FiPercent,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiImage,
  FiPackage,
  FiZap,
  FiDollarSign,
  FiType,
  FiFileText,
  FiUpload,
  FiX
} from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import { createOffer, updateOffer, prepareOfferFormData, type SpecialOffer } from '../../../api/offers';

interface OffersFormProps {
  initial?: Partial<SpecialOffer>;
  onSaved: () => void;
}

const OffersForm = ({ initial, onSaved }: OffersFormProps) => {
  const [form, setForm] = useState<Partial<SpecialOffer>>({
    title: '',
    description: '',
    short_description: '',
    offer_type: 'seasonal',
    discount_type: 'percent',
    discount_value: 0,
    original_price: undefined,
    discounted_price: undefined,
    discount_code: '',
    terms: '',
    valid_from: new Date().toISOString().slice(0, 16),
    valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: true,
    is_featured: false,
    priority: 0,
    cta_text: 'Claim Offer',
    cta_link: '',
    features: [],
    conditions: [],
    icon_name: 'FiTag',
    gradient_colors: 'from-red-500 to-orange-500',
    button_text: 'Claim Offer',
    button_url: '',
    ...initial,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (form.image) {
      setForm({ ...form, image: undefined });
    }
  };

  // Handle array field changes
  const handleArrayChange = (field: 'conditions' | 'features' | 'terms', index: number, value: string) => {
    const items = [...(form[field] || [])];
    items[index] = value;
    setForm({ ...form, [field]: items });
  };

  const addArrayItem = (field: 'conditions' | 'features' | 'terms') => {
    setForm({
      ...form,
      [field]: [...(form[field] || []), ''],
    });
  };

  const removeArrayItem = (field: 'conditions' | 'features' | 'terms', index: number) => {
    const items = [...(form[field] || [])];
    items.splice(index, 1);
    setForm({ ...form, [field]: items });
  };

  // Calculate discounted price when original price or discount changes
  useEffect(() => {
    if (form.original_price && form.discount_value) {
      if (form.discount_type === 'percent') {
        const discountAmount = (form.original_price * form.discount_value) / 100;
        setForm(prev => ({ ...prev, discounted_price: form.original_price! - discountAmount }));
      } else if (form.discount_type === 'flat') {
        setForm(prev => ({ ...prev, discounted_price: form.original_price! - form.discount_value! }));
      }
    }
  }, [form.original_price, form.discount_value, form.discount_type]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.title?.trim()) newErrors.title = 'Title is required';
    if (!form.description?.trim()) newErrors.description = 'Description is required';
    if (form.discount_value === undefined || form.discount_value < 0) {
      newErrors.discount_value = 'Discount value must be positive';
    }
    if (form.discount_type === 'percent' && (form.discount_value ?? 0) > 100) {
      newErrors.discount_value = 'Percentage discount cannot exceed 100%';
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
      // Prepare form data
      const formData = prepareOfferFormData(form, imageFile || undefined);
      
      console.log('Submitting offer data:', Object.fromEntries(formData.entries()));

      if (form.id) {
        await updateOffer(form.id, formData);
      } else {
        await createOffer(formData);
      }
      
      onSaved();
    } catch (error: any) {
      console.error('Error saving offer:', error);
      
      // Handle validation errors from backend
      if (error.response?.data) {
        const backendErrors = error.response.data;
        console.log('Backend errors:', backendErrors);
        
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

  // Icon options
  const iconOptions = [
    { value: 'FiTag', label: 'Tag', icon: FiTag },
    { value: 'FiStar', label: 'Star', icon: FiStar },
    { value: 'FiGift', label: 'Gift', icon: FiGift },
    { value: 'FiClock', label: 'Clock', icon: FiClock },
    { value: 'FiPercent', label: 'Percent', icon: FiPercent },
    { value: 'FiCheckCircle', label: 'Check', icon: FiCheckCircle },
    { value: 'FiImage', label: 'Image', icon: FiImage },
    { value: 'FiPackage', label: 'Package', icon: FiPackage },
    { value: 'FiZap', label: 'Zap', icon: FiZap },
  ];

  // Offer type options
  const offerTypeOptions = [
    { value: 'seasonal', label: 'Seasonal Offer', icon: FiCalendar },
    { value: 'limited', label: 'Limited Time', icon: FiClock },
    { value: 'bundle', label: 'Bundle Offer', icon: FiPackage },
    { value: 'launch', label: 'Launch Offer', icon: FiZap },
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

      {/* Image Upload */}
      <div>
        <label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiImage /> Offer Image
        </label>
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center ${
              imagePreview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            {imagePreview || form.image ? (
              <div className="relative">
                <img
                  src={imagePreview || form.image}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                  <FiUpload className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Click to upload image</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Type */}
      <div>
        <label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiType /> Offer Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {offerTypeOptions.map((type) => {
            const Icon = type.icon;
            return (
              <button
                type="button"
                key={type.value}
                onClick={() => setForm({ ...form, offer_type: type.value as any })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  form.offer_type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-xs">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiDollarSign /> Original Price (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.original_price || ''}
            onChange={e => setForm({ ...form, original_price: parseFloat(e.target.value) || undefined })}
            placeholder="e.g., 999"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiPercent /> Discount Type
          </label>
          <select
            value={form.discount_type}
            onChange={e => setForm({ ...form, discount_type: e.target.value as any })}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        
        <div className="relative">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            {form.discount_type === 'percent' ? <FiPercent /> : <FiDollarSign />}
            Discount Value *
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step={form.discount_type === 'percent' ? "0.01" : "1"}
              value={form.discount_value || 0}
              onChange={e => {
                const value = parseFloat(e.target.value) || 0;
                if (form.discount_type === 'percent' && value > 100) {
                  setForm({ ...form, discount_value: 100 });
                } else {
                  setForm({ ...form, discount_value: value });
                }
                if (errors.discount_value) setErrors({...errors, discount_value: ''});
              }}
              required
              className={`w-full border rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.discount_value ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={form.discount_type === 'percent' ? "0" : "0"}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {form.discount_type === 'percent' ? '%' : '₹'}
            </span>
          </div>
          {errors.discount_value && <p className="text-red-500 text-sm mt-1">{errors.discount_value}</p>}
        </div>
      </div>

      {/* Calculated Price */}
      {form.discounted_price !== undefined && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Discounted Price:</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{form.discounted_price.toLocaleString()}
              </p>
            </div>
            {form.original_price && (
              <div className="text-right">
                <p className="text-sm text-gray-500 line-through">
                  ₹{form.original_price.toLocaleString()}
                </p>
                <p className="text-lg font-bold text-green-600">
                  Save {((form.original_price - form.discounted_price) / form.original_price * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Discount Code */}
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

      {/* Terms and Conditions */}
      <div className="space-y-3">
        <label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiFileText /> Terms and Conditions (Optional)
        </label>
        <textarea
          value={form.terms || ''}
          onChange={e => setForm({ ...form, terms: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter terms and conditions for this offer..."
        />
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

      {/* CTA Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiTag /> CTA Text
          </label>
          <input
            type="text"
            value={form.cta_text || 'Claim Offer'}
            onChange={e => setForm({ ...form, cta_text: e.target.value })}
            placeholder="e.g., Claim Offer, Get Deal, Learn More"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiLink /> CTA Link (Optional)
          </label>
          <input
            type="url"
            value={form.cta_link || ''}
            onChange={e => setForm({ ...form, cta_link: e.target.value })}
            placeholder="https://example.com/offer"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
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

          <div>
            <label className="text-sm font-semibold mb-2 block">Priority</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={form.priority || 0}
                onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={form.priority || 0}
                onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
                className="w-24 border border-gray-300 rounded-lg p-2 text-center"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Lower numbers appear first (0 = highest priority)</p>
          </div>
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
              {form.discount_value || 0}{form.discount_type === 'percent' ? '%' : '₹'} OFF
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default OffersForm;