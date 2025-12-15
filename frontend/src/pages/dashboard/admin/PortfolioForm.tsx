import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../../api/api';
import { createPortfolio, updatePortfolio } from '../../../api/portfolio';
import { listServices } from '../../../api/services';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { FiUpload, FiVideo, FiPlus, FiX, FiImage } from 'react-icons/fi';

// ===========================
// TYPE DEFINITIONS
// ===========================
interface Service {
  id: string | number;
  title: string;
}

interface PortfolioData {
  id?: string | number;
  title: string;
  client_name: string;
  description: string;
  service: string;
  featured_image: string | null;
  images: string[];
  video: string | null;
}

interface PortfolioFormProps {
  initial?: PortfolioData;
  onSaved: () => void;
}

interface FormErrors {
  title?: string;
  service?: string;
  featuredImage?: string;
  general?: string;
}

// ===========================
// MAIN COMPONENT
// ===========================
export default function PortfolioForm({ initial, onSaved }: PortfolioFormProps) {
  const { user } = useAuth();
  
  // Form fields
  const [title, setTitle] = useState(initial?.title || '');
  const [client, setClient] = useState(initial?.client_name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [service, setService] = useState(initial?.service || '');
  
  // Services dropdown
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  // Featured image
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(
    initial?.featured_image || null
  );
  
  // Gallery images
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    initial?.images || []
  );
  
  // Video
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(
    initial?.video || null
  );
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Refs for file inputs
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ===========================
  // LOAD SERVICES
  // ===========================
  useEffect(() => {
    const loadServices = async () => {
      try {
        setServicesLoading(true);
        
        // Add department filter for service_head users
        const params: any = {};
        if (user?.role === 'service_head' && (user as any).department) {
          const dept = (user as any).department;
          params.department = typeof dept === 'object' ? dept.id : dept;
          console.log('📋 PortfolioForm: Filtering services by department', params.department);
        }
        
        const res = await listServices(params);
        setServices(res.data);
        console.log('📦 PortfolioForm: Services loaded:', res.data.length);
      } catch (error) {
        console.error('Failed to load services:', error);
        setErrors(prev => ({ ...prev, general: 'Failed to load services' }));
      } finally {
        setServicesLoading(false);
      }
    };

    if (user) {
      loadServices();
    }
  }, [user]);

  // ===========================
  // CLEANUP PREVIEW URLs
  // ===========================
  useEffect(() => {
    return () => {
      if (featuredPreview && featuredPreview.startsWith('blob:')) {
        URL.revokeObjectURL(featuredPreview);
      }
      galleryPreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      if (videoPreview && videoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [featuredPreview, galleryPreviews, videoPreview]);

  // ===========================
  // FILE UPLOAD HELPER
  // ===========================
  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    
    const res = await api.post('/api/upload/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return res.data.url;
  };

  // ===========================
  // VALIDATION
  // ===========================
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!service) {
      newErrors.service = 'Please select a service';
    }

    if (!initial && !featuredImage) {
      newErrors.featuredImage = 'Featured image is required for new projects';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===========================
  // FEATURED IMAGE HANDLERS
  // ===========================
  const handleFeaturedImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, featuredImage: 'Please select a valid image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, featuredImage: 'Image must be less than 5MB' }));
      return;
    }

    if (featuredPreview && featuredPreview.startsWith('blob:')) {
      URL.revokeObjectURL(featuredPreview);
    }

    setFeaturedImage(file);
    setFeaturedPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, featuredImage: undefined }));
  }, [featuredPreview]);

  const removeFeaturedImage = useCallback(() => {
    if (featuredPreview && featuredPreview.startsWith('blob:')) {
      URL.revokeObjectURL(featuredPreview);
    }
    setFeaturedImage(null);
    setFeaturedPreview(null);
    if (featuredInputRef.current) {
      featuredInputRef.current.value = '';
    }
  }, [featuredPreview]);

  // ===========================
  // GALLERY IMAGES HANDLERS
  // ===========================
  const handleGalleryImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ 
        ...prev, 
        general: 'Some files were skipped (invalid type or size > 5MB)' 
      }));
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setGalleryImages(prev => [...prev, ...validFiles]);
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
    
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  }, []);

  const removeGalleryImage = useCallback((index: number) => {
    const preview = galleryPreviews[index];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  }, [galleryPreviews]);

  // ===========================
  // VIDEO HANDLERS
  // ===========================
  const handleVideo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrors(prev => ({ ...prev, general: 'Please select a valid video file' }));
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, general: 'Video must be less than 50MB' }));
      return;
    }

    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  }, [videoPreview]);

  const removeVideo = useCallback(() => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, [videoPreview]);

  // ===========================
  // FORM SUBMISSION
  // ===========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setErrors({});

    try {
      let featuredImageUrl = initial?.featured_image || null;
      if (featuredImage) {
        setUploadProgress(20);
        featuredImageUrl = await uploadFile(featuredImage);
      }

      let galleryUrls = initial?.images || [];
      if (galleryImages.length > 0) {
        setUploadProgress(40);
        galleryUrls = await Promise.all(
          galleryImages.map(file => uploadFile(file))
        );
      }

      let videoUrl = initial?.video || null;
      if (video) {
        setUploadProgress(70);
        videoUrl = await uploadFile(video);
      }

      setUploadProgress(90);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        client_name: client.trim(),
        service,
        featured_image: featuredImageUrl,
        images: galleryUrls,
        video: videoUrl,
      };

      if (initial?.id) {
        await updatePortfolio(Number(initial.id), payload);
      } else {
        await createPortfolio(payload);
      }

      setUploadProgress(100);
      onSaved();
    } catch (err: any) {
      console.error('Portfolio submission error:', err);
      setErrors({
        general: err?.response?.data?.message || 'Failed to save portfolio. Please try again.'
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Error Alert */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {errors.general}
        </div>
      )}

      {/* Upload Progress */}
      {loading && uploadProgress > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-700">Uploading...</span>
            <span className="text-xs text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid Layout - 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          
          {/* Project Title */}
          <div>
            <label className="font-semibold block mb-1 text-sm text-gray-700">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter project title"
              disabled={loading}
            />
            {errors.title && <p className="text-red-500 text-xs mt-0.5">{errors.title}</p>}
          </div>

          {/* Client Name */}
          <div>
            <label className="font-semibold block mb-1 text-sm text-gray-700">Client Name</label>
            <input
              type="text"
              value={client}
              onChange={e => setClient(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter client name"
              disabled={loading}
            />
          </div>

          {/* Service Dropdown */}
          <div>
            <label className="font-semibold block mb-1 text-sm text-gray-700">
              Service <span className="text-red-500">*</span>
            </label>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className={`w-full border ${errors.service ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={loading || servicesLoading}
            >
              <option value="">
                {servicesLoading ? 'Loading...' : 'Select service'}
              </option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            {errors.service && <p className="text-red-500 text-xs mt-0.5">{errors.service}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold block mb-1 text-sm text-gray-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Project details..."
              disabled={loading}
            />
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">

          {/* Featured Image */}
          <div>
            <label className="font-semibold flex items-center gap-1.5 mb-1 text-sm text-gray-700">
              <FiImage size={14} /> Featured Image <span className="text-red-500">*</span>
            </label>
            
            {!featuredPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <input
                  ref={featuredInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImage}
                  className="hidden"
                  id="featured-upload"
                  disabled={loading}
                />
                <label htmlFor="featured-upload" className="cursor-pointer">
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-1" />
                  <p className="text-sm text-gray-600">Upload image</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG (5MB max)</p>
                </label>
              </div>
            ) : (
              <div className="relative group border rounded-lg overflow-hidden">
                <img 
                  src={featuredPreview} 
                  alt="Featured" 
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={removeFeaturedImage}
                  disabled={loading}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
            {errors.featuredImage && <p className="text-red-500 text-xs mt-0.5">{errors.featuredImage}</p>}
          </div>

          {/* Video Upload */}
          <div>
            <label className="font-semibold flex items-center gap-1.5 mb-1 text-sm text-gray-700">
              <FiVideo size={14} /> Video (Optional)
            </label>

            {!videoPreview ? (
              <div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideo}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-0.5">MP4, MOV (50MB max)</p>
              </div>
            ) : (
              <div className="relative group">
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded-lg shadow-sm h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  disabled={loading}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Gallery Images - Full Width */}
      <div>
        <label className="font-semibold flex items-center gap-1.5 mb-2 text-sm text-gray-700">
          <FiUpload size={14} /> Gallery Images
        </label>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryImages}
          className="hidden"
          id="gallery-upload"
          disabled={loading}
        />

        <label
          htmlFor="gallery-upload"
          className="inline-flex items-center gap-1.5 cursor-pointer px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus size={14} /> Add Images
        </label>

        {galleryPreviews.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-3">
            {galleryPreviews.map((img, index) => (
              <div key={index} className="relative group border rounded overflow-hidden aspect-square">
                <img
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  disabled={loading}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button 
          type="submit" 
          isLoading={loading} 
          className="w-full"
          disabled={loading}
        >
          {initial ? 'Update Portfolio' : 'Create Portfolio'}
        </Button>
      </div>
    </form>
  );
}