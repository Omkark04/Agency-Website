import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFormByService, submitForm } from '../../api/forms';
import { uploadMedia } from '../../api/media';
import type { ServiceForm, FormField } from '../../api/forms';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from '../../pages/landing/components/AuthModal';
import OrderInitiationAnimation from '../animations/OrderInitiationAnimation';

interface DynamicFormRendererProps {
  serviceId: number;
  priceCardId?: number; // Optional price card ID
  portfolioProjectId?: number; // Optional portfolio project ID
  onSuccess?: (orderId: number) => void;
}

const DynamicFormRenderer = ({ serviceId, priceCardId, portfolioProjectId, onSuccess }: DynamicFormRendererProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<ServiceForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileData, setFileData] = useState<Record<string, File[]>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
    orderId?: number;
  } | null>(null);
  
  // Authentication and animation states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<{
    data: Record<string, any>;
    files: Record<string, File[]>;
  } | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    loadForm();
  }, [serviceId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await getFormByService(serviceId);
      setForm(response.data);
      
      // Initialize form data
      const initialData: Record<string, any> = {};
      response.data.fields?.forEach((field: FormField) => {
        if (field.field_type === 'checkbox') {
          initialData[field.id!.toString()] = false;
        } else if (field.field_type === 'multi_select') {
          initialData[field.id!.toString()] = [];
        } else {
          initialData[field.id!.toString()] = '';
        }
      });
      setFormData(initialData);
    } catch (error: any) {
      console.error('Error loading form:', error);
      if (error.response?.status === 404) {
        setForm(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (files) {
      setFileData(prev => ({ ...prev, [fieldId]: Array.from(files) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    form?.fields?.forEach((field: FormField) => {
      const fieldId = field.id!.toString();
      const value = formData[fieldId];
      
      if (field.required) {
        if (field.field_type === 'checkbox' && !value) {
          newErrors[fieldId] = `${field.label} is required`;
        } else if (field.field_type === 'multi_select' && (!value || value.length === 0)) {
          newErrors[fieldId] = `${field.label} is required`;
        } else if (field.field_type === 'media' && (!fileData[fieldId] || fileData[fieldId].length === 0)) {
          newErrors[fieldId] = `${field.label} is required`;
        } else if (!value || value === '') {
          newErrors[fieldId] = `${field.label} is required`;
        }
      }
      
      // Validate number fields
      if (field.field_type === 'number' && value && isNaN(Number(value))) {
        newErrors[fieldId] = `${field.label} must be a number`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFiles = async (): Promise<boolean> => {
    try {
      const uploadedUrls: Record<string, string[]> = {};
      
      for (const [fieldId, files] of Object.entries(fileData)) {
        const urls: string[] = [];
        
        for (const file of files) {
          try {
            const response = await uploadMedia(file, `Form submission - ${form?.title}`);
            urls.push(response.data.url);
          } catch (error) {
            console.error('Error uploading file:', error);
            setErrors(prev => ({ 
              ...prev, 
              [fieldId]: 'Failed to upload file. Please try again.' 
            }));
            return false;
          }
        }
        
        uploadedUrls[fieldId] = urls;
      }
      
      setUploadedFiles(uploadedUrls);
      return true;
    } catch (error) {
      console.error('Error in file upload process:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check authentication before submitting
    if (!isAuthenticated) {
      // Store form data for later submission
      setPendingFormData({
        data: formData,
        files: fileData
      });
      setShowAuthModal(true);
      return;
    }
    
    // If authenticated, proceed with submission
    await submitFormData();
  };
  
  // Handle successful authentication
  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    
    // Wait a bit for auth state to update
    // This ensures the access token is properly set in localStorage
    // and the auth context has updated before we submit the form
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Submit the pending form data
    await submitFormData();
  };
  
  // Actual form submission logic
  const submitFormData = async () => {
    setSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Use pending data if available, otherwise use current form data
      const dataToSubmit = pendingFormData?.data || formData;
      const filesToSubmit = pendingFormData?.files || fileData;
      
      // Upload files first if any
      if (Object.keys(filesToSubmit).length > 0) {
        // Temporarily set fileData for upload
        const currentFileData = fileData;
        setFileData(filesToSubmit);
        
        const uploadSuccess = await uploadFiles();
        
        // Restore original fileData
        setFileData(currentFileData);
        
        if (!uploadSuccess) {
          setSubmitting(false);
          return;
        }
      }
      
      // Submit form
      const submissionData: any = {
        data: dataToSubmit,
        files: uploadedFiles,
        client_email: dataToSubmit['email'] || '',
        portfolio_project_id: portfolioProjectId // Add portfolio project ID
      };

      // Include price_card_id if provided
      if (priceCardId) {
        submissionData.data.price_card_id = priceCardId;
      }
      
      const response = await submitForm(form!.id!, submissionData);
      
      setSubmitStatus({
        success: true,
        message: response.data.message || 'Form submitted successfully!',
        orderId: response.data.order_id
      });
      
      // Clear pending data
      setPendingFormData(null);
      
      // Show animation
      setShowAnimation(true);
      
      // Wait for animation, then close modal
      setTimeout(() => {
        setShowAnimation(false);
        
        // Reset form
        setFormData({});
        setFileData({});
        setUploadedFiles({});
        
        // Call success callback to close modal
        if (onSuccess) {
          onSuccess(response.data.order_id);
        }
        
        // User stays on current page - no navigation
      }, 3000);
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        setSubmitStatus({
          success: false,
          message: 'Authentication error. Please try signing in again.'
        });
        // Clear pending data and show auth modal again
        setPendingFormData({
          data: formData,
          files: fileData
        });
        setShowAuthModal(true);
      } else {
        setSubmitStatus({
          success: false,
          message: error.response?.data?.error || error.response?.data?.message || 'Failed to submit form. Please try again.'
        });
      }
      setPendingFormData(null);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldId = field.id!.toString();
    const value = formData[fieldId];
    const error = errors[fieldId];

    const inputClasses = `w-full px-4 py-3 rounded-lg border ${
      error 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all`;

    switch (field.field_type) {
      case 'text':
      case 'short_text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            placeholder={field.placeholder}
            className={inputClasses}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            placeholder={field.placeholder}
            className={inputClasses}
            required={field.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={inputClasses}
            required={field.required}
          />
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            className={inputClasses}
            required={field.required}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multi_select':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(fieldId, newValues);
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleInputChange(fieldId, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
              required={field.required}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {field.placeholder || field.label}
            </span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            placeholder={field.placeholder}
            className={inputClasses}
            required={field.required}
          />
        );

      case 'media':
        return (
          <div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(fieldId, e.target.files)}
                  className="hidden"
                  accept="image/*,video/*"
                  required={field.required}
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {field.placeholder || 'Upload images or videos'}
              </p>
            </div>
            {fileData[fieldId] && fileData[fieldId].length > 0 && (
              <div className="mt-2 space-y-1">
                {fileData[fieldId].map((file, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-3" />
        <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          No form available for this service yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Status Message */}
        {submitStatus && (
          <motion.div
            id="form-status"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              submitStatus.success
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {submitStatus.success ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{submitStatus.message}</p>
              {submitStatus.orderId && (
                <p className="text-sm mt-1">
                  Order #{submitStatus.orderId} has been created. We'll contact you shortly!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {form.title}
          </h2>
          {form.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {form.description}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields?.map((field: FormField) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.help_text && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {field.help_text}
                  </p>
                )}
                {renderField(field)}
                {errors[field.id!.toString()] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[field.id!.toString()]}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90'
              }`}
            >
              {submitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
        onAuthSuccess={handleAuthSuccess}
      />
      
      {/* Order Initiation Animation */}
      <OrderInitiationAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
      />
    </>
  );
};

export default DynamicFormRenderer;
