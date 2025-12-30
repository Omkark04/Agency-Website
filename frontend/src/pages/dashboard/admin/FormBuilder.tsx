import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save, Eye, Plus, Trash2, GripVertical, Settings,
  Type, Hash, AlignLeft, FileText, ChevronDown, CheckSquare, Upload,
  Search, Edit, Copy, List, X
} from 'lucide-react';
import { createForm, updateForm, getForm, createField, updateField, deleteField, listForms, deleteForm } from '../../../api/forms';
import type { ServiceForm, FormField } from '../../../api/forms';
import { listServices } from '../../../api/services';
import api from '../../../api/api';
import { useAuth } from '../../../hooks/useAuth';
import { NoDepartmentMessage } from '../../../components/dashboard/NoDepartmentMessage';

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
  const { user } = useAuth();
  const isServiceHeadWithoutDept = user?.role === 'service_head' && !(user as any).department;
  const [loading, setLoading] = useState(false);
  const [loadingForms, setLoadingForms] = useState(true); // For initial forms list load
  const [duplicating, setDuplicating] = useState(false); // For form duplication
  const [services, setServices] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<ServiceForm>>({
    title: '',
    description: '',
    service: 0,
    is_active: false,
    card_type: undefined, // Start with no selection
    selected_offer_id: undefined,
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form History State
  const [allForms, setAllForms] = useState<ServiceForm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDelete, setFormToDelete] = useState<ServiceForm | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (!isServiceHeadWithoutDept && user) {
      loadServices();
      loadOffers();
      loadAllForms();
      if (id) {
        loadForm(parseInt(id));
        setShowHistory(false);
      }
    }
  }, [id, user?.role, (user as any)?.department?.id]); // Re-run when user or department changes

  const loadServices = async () => {
    try {
      console.log('🔍 FormBuilder: Loading services...');
      console.log('👤 Current user:', user);
      console.log('🏢 User department:', (user as any)?.department);
      
      // Add department filter for service_head users
      const params: any = {};
      if (user?.role === 'service_head' && (user as any).department) {
        const dept = (user as any).department;
        params.department = typeof dept === 'object' ? dept.id : dept;
        console.log('✅ Adding department filter:', params.department);
      }
      
      console.log('📡 API call params:', params);
      const response = await listServices(params);
      console.log('📦 Services received:', response.data.length);
      setServices(response.data);
    } catch (error) {
      console.error('❌ Error loading services:', error);
    }
  };

  const loadOffers = async () => {
    try {
      const response = await api.get('/api/offers/');
      const data = response.data.results || response.data;
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading offers:', error);
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

  const loadAllForms = async () => {
    try {
      setLoadingForms(true);
      const response = await listForms();
      setAllForms(response.data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoadingForms(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    try {
      await deleteForm(formToDelete.id!);
      setShowDeleteModal(false);
      setFormToDelete(null);
      await loadAllForms();
      alert('Form deleted successfully!');
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form');
    }
  };

  const handleDuplicateForm = async (formToDuplicate: ServiceForm) => {
    try {
      setDuplicating(true);
      // First, fetch the full form with all its fields
      const fullFormResponse = await getForm(formToDuplicate.id!);
      const originalForm = fullFormResponse.data;
      
      // Create the duplicated form (without fields first)
      const duplicatedFormData = {
        ...formToDuplicate,
        title: `${formToDuplicate.title} (Copy)`,
        is_active: false
      };
      delete duplicatedFormData.id;
      delete duplicatedFormData.created_at;
      delete duplicatedFormData.updated_at;
      delete duplicatedFormData.fields; // Remove fields from form creation
      
      const newFormResponse = await createForm(duplicatedFormData);
      const newFormId = newFormResponse.data.id;
      
      // Now duplicate all fields from the original form
      if (originalForm.fields && originalForm.fields.length > 0) {
        for (const field of originalForm.fields) {
          const newField: any = {
            ...field,
            form: newFormId
          };
          delete newField.id;
          delete newField.created_at;
          delete newField.updated_at;
          
          await createField(newField);
        }
      }
      
      alert('Form duplicated successfully with all fields!');
      navigate(`/dashboard/forms/${newFormId}`);
    } catch (error) {
      console.error('Error duplicating form:', error);
      alert('Error duplicating form');
    } finally {
      setDuplicating(false);
    }
  };

  const handleCreateNew = () => {
    setForm({
      title: '',
      description: '',
      service: 0,
      is_active: false,
      card_type: undefined, // Start with no selection
      selected_offer_id: undefined
    });
    setFields([]);
    setShowHistory(false);
    navigate('/dashboard/forms/new');
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

  // Show empty state if service_head has no department
  if (isServiceHeadWithoutDept) {
    return <NoDepartmentMessage />;
  }

  // Show loading state when fetching form data
  if (loading && id) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {form.id ? 'Edit Form' : showHistory ? 'Form Builder' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showHistory ? 'Manage your service forms' : 'Build custom forms for your services'}
          </p>
        </div>
        <div className="flex gap-3">
          {!showHistory && (
            <>
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <List className="h-5 w-5" />
                View All Forms
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Eye className="h-5 w-5" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              <button
                onClick={handleSaveForm}
                disabled={
                  loading || 
                  !form.card_type ||
                  (form.card_type === 'service' && !form.service) || 
                  (form.card_type === 'offer' && !form.selected_offer_id)
                }
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                Save Form
              </button>
            </>
          )}
          {showHistory && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              Create New Form
            </button>
          )}
        </div>
      </div>

      {/* Form History Section */}
      {showHistory && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            {/* Search and Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Forms Table */}
            <div className="overflow-x-auto">
              {loadingForms ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading forms...</p>
                  </div>
                </div>
              ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Form Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {allForms
                    .filter(f => {
                      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          f.service_title?.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesStatus = statusFilter === 'all' ||
                                          (statusFilter === 'active' && f.is_active) ||
                                          (statusFilter === 'inactive' && !f.is_active);
                      return matchesSearch && matchesStatus;
                    })
                    .map((formItem) => (
                      <tr key={formItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formItem.title}
                          </div>
                          {formItem.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {formItem.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formItem.service_title || `Service #${formItem.service}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            formItem.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {formItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formItem.created_at ? new Date(formItem.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/forms/${formItem.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateForm(formItem)}
                              disabled={duplicating}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title={duplicating ? "Duplicating..." : "Duplicate"}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setFormToDelete(formItem);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              )}
              
              {!loadingForms && allForms.filter(f => {
                const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    f.service_title?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'all' ||
                                    (statusFilter === 'active' && f.is_active) ||
                                    (statusFilter === 'inactive' && !f.is_active);
                return matchesSearch && matchesStatus;
              }).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400 opacity-50" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery || statusFilter !== 'all' ? 'No forms match your filters' : 'No forms created yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Editor Section */}
      {!showHistory && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Form Details
            </h2>
            
            <div className="space-y-4">
              {/* CARD TYPE - MOVED TO TOP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Type *
                </label>
                <select
                  value={form.card_type || ''}
                  onChange={(e) => setForm({ ...form, card_type: e.target.value as 'service' | 'offer' | undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Card Type</option>
                  <option value="service">Service Card</option>
                  <option value="offer">Offer Card</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose whether this form is for a service or an offer
                </p>
              </div>

              {/* SERVICE SELECTION (only for service cards) */}
              {form.card_type === 'service' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service *
                  </label>
                  <select
                    value={form.service || ''}
                    onChange={(e) => setForm({ ...form, service: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={form.card_type === 'service'}
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This form will be embedded in the selected service's button
                  </p>
                </div>
              )}

              {/* OFFER SELECTION (conditional) */}
              {form.card_type === 'offer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Offer *
                  </label>
                  <select
                    value={form.selected_offer_id || ''}
                    onChange={(e) => setForm({ ...form, selected_offer_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={form.card_type === 'offer'}
                  >
                    <option value="">Select an offer</option>
                    {offers.map((offer: any) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.title} ({offer.offer_category === 'special' ? 'Special Offer' : 'Regular Offer'})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This form will be embedded in the selected offer's button
                  </p>
                </div>
              )}

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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && formToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Form?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{formToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteForm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFormToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {((editedField.options && editedField.options.length > 0) ? editedField.options : ['']).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...((editedField.options && editedField.options.length > 0) ? editedField.options : [''])];
                        newOptions[index] = e.target.value;
                        setEditedField({ ...editedField, options: newOptions.filter(o => o.trim() || newOptions.indexOf(o) === index) });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {((editedField.options?.length || 0) > 1) && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = (editedField.options || ['']).filter((_, i) => i !== index);
                          setEditedField({ ...editedField, options: newOptions.length > 0 ? newOptions : [''] });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Remove option"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditedField({
                      ...editedField,
                      options: [...(editedField.options || ['']), '']
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              </div>
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
