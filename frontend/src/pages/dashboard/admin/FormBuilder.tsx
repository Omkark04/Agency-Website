import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save, Eye, Plus, Trash2, GripVertical, Settings,
  Type, Hash, AlignLeft, FileText, ChevronDown, CheckSquare, Upload
} from 'lucide-react';
import { createForm, updateForm, getForm, createField, updateField, deleteField } from '../../../api/forms';
import type { ServiceForm, FormField } from '../../../api/forms';
import { listServices } from '../../../api/services';

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'short_text', label: 'Short Text', icon: AlignLeft },
  { type: 'long_text', label: 'Long Text', icon: FileText },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'multi_select', label: 'Multi Select', icon: CheckSquare },
  { type: 'media', label: 'File Upload', icon: Upload },
];

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<ServiceForm>>({
    title: '',
    description: '',
    service: 0,
    is_active: false
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadServices();
    if (id) {
      loadForm(parseInt(id));
    }
  }, [id]);

  const loadServices = async () => {
    try {
      const response = await listServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadForm = async (formId: number) => {
    try {
      setLoading(true);
      const response = await getForm(formId);
      setForm(response.data);
      setFields(response.data.fields || []);
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async () => {
    try {
      setLoading(true);
      let savedForm;
      
      if (form.id) {
        savedForm = await updateForm(form.id, form);
      } else {
        savedForm = await createForm(form);
      }
      
      // Save fields
      for (const field of fields) {
        if (field.id) {
          await updateField(field.id, { ...field, form: savedForm.data.id });
        } else {
          await createField({ ...field, form: savedForm.data.id });
        }
      }
      
      alert('Form saved successfully!');
      if (!form.id) {
        navigate(`/dashboard/forms/${savedForm.data.id}`);
      }
    } catch (error: any) {
      console.error('Error saving form:', error);
      alert('Error saving form: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const addField = (fieldType: string) => {
    const newField: FormField = {
      label: `New ${fieldType} field`,
      field_type: fieldType as any,
      required: false,
      placeholder: '',
      help_text: '',
      options: fieldType === 'dropdown' || fieldType === 'multi_select' ? [] : undefined,
      order: fields.length
    };
    setFields([...fields, newField]);
  };

  const removeField = async (index: number) => {
    const field = fields[index];
    if (field.id && confirm('Delete this field?')) {
      try {
        await deleteField(field.id);
      } catch (error) {
        console.error('Error deleting field:', error);
      }
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((field, idx) => field.order = idx);
    setFields(newFields);
  };

  const openFieldEditor = (field: FormField, index: number) => {
    setEditingField({ ...field, order: index });
    setShowFieldEditor(true);
  };

  const saveFieldEdit = (updatedField: FormField) => {
    const newFields = [...fields];
    newFields[updatedField.order] = updatedField;
    setFields(newFields);
    setShowFieldEditor(false);
    setEditingField(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {form.id ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Build custom forms for your services
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Eye className="h-5 w-5" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={handleSaveForm}
            disabled={loading || !form.service}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            Save Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Form Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service *
                </label>
                <select
                  value={form.service || ''}
                  onChange={(e) => setForm({ ...form, service: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Form Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Website Development Inquiry"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe what this form is for..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (publicly visible)
                </label>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Form Fields
            </h2>

            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No fields yet. Add fields from the palette →</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {field.field_type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveField(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveField(index, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => openFieldEditor(field, index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeField(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Field Palette */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Field Types
            </h2>
            <div className="space-y-2">
              {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{label}</span>
                  <Plus className="h-4 w-4 ml-auto text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {showFieldEditor && editingField && (
        <FieldEditorModal
          field={editingField}
          onSave={saveFieldEdit}
          onClose={() => {
            setShowFieldEditor(false);
            setEditingField(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <FormPreviewModal
          form={form}
          fields={fields}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

// Field Editor Modal Component
const FieldEditorModal = ({ field, onSave, onClose }: any) => {
  const [editedField, setEditedField] = useState(field);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Field
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label *
            </label>
            <input
              type="text"
              value={editedField.label}
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={editedField.placeholder || ''}
              onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Help Text
            </label>
            <textarea
              value={editedField.help_text || ''}
              onChange={(e) => setEditedField({ ...editedField, help_text: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {(editedField.field_type === 'dropdown' || editedField.field_type === 'multi_select') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={(editedField.options || []).join('\n')}
                onChange={(e) => setEditedField({ 
                  ...editedField, 
                  options: e.target.value.split('\n').filter(o => o.trim()) 
                })}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={editedField.required}
              onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Required field
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(editedField)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Form Preview Modal Component
const FormPreviewModal = ({ form, fields, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Form Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {form.title || 'Untitled Form'}
          </h3>
          {form.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {form.description}
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field: FormField, index: number) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.help_text && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {field.help_text}
                  </p>
                )}
                
                {field.field_type === 'long_text' ? (
                  <textarea
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    disabled
                  />
                ) : field.field_type === 'dropdown' ? (
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" disabled>
                    <option>{field.placeholder || 'Select an option'}</option>
                    {field.options?.map((opt, i) => (
                      <option key={i}>{opt}</option>
                    ))}
                  </select>
                ) : field.field_type === 'checkbox' ? (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" disabled />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{field.placeholder}</span>
                  </div>
                ) : field.field_type === 'media' ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Upload file</p>
                  </div>
                ) : (
                  <input
                    type={field.field_type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    disabled
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
