import { useEffect, useState } from 'react';
import { createDepartment, updateDepartment } from '../../../api/departments';
import api from '../../../api/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
  FiLayers,
  FiUsers,
  FiUpload,
  FiX,
  FiImage,
  FiVideo,
  FiType
} from 'react-icons/fi';
import MediaPickerModal from './components/MediaPickerModal';
import '../../../styles/admin/DepartmentForm.css';

export default function DepartmentForm({ initial, onSaved }: any) {
  const [title, setTitle] = useState(initial?.title || '');
  const [shortDescription, setShortDescription] = useState(initial?.short_description || '');
  const [teamHeadId, setTeamHeadId] = useState<number | null>(
    initial?.team_head?.id || null
  );
  const [priority, setPriority] = useState<number>(initial?.priority || 999);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(initial?.logo || '');
  const [teamHeads, setTeamHeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New Hero Fields
  const [heroCaption, setHeroCaption] = useState(initial?.hero_caption || '');
  const [heroBgDesktop, setHeroBgDesktop] = useState<number | null>(initial?.hero_bg_desktop || null);
  const [heroBgMobile, setHeroBgMobile] = useState<number | null>(initial?.hero_bg_mobile || null);
  const [heroBgDesktopPreview, setHeroBgDesktopPreview] = useState<string>(initial?.hero_bg_desktop_details?.url || '');
  const [heroBgMobilePreview, setHeroBgMobilePreview] = useState<string>(initial?.hero_bg_mobile_details?.url || '');

  // Modal states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'desktop' | 'mobile' | null>(null);

  useEffect(() => {
    const loadHeads = async () => {
      const res = await api.get('/api/auth/admin/users/');
      const serviceHeads = res.data.filter((u: any) => u.role === 'service_head');
      setTeamHeads(serviceHeads);
    };
    loadHeads();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openPicker = (target: 'desktop' | 'mobile') => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const handleMediaSelect = (item: any) => {
    if (pickerTarget === 'desktop') {
      setHeroBgDesktop(item.id);
      setHeroBgDesktopPreview(item.url);
    } else if (pickerTarget === 'mobile') {
      setHeroBgMobile(item.id);
      setHeroBgMobilePreview(item.url);
    }
    setPickerOpen(false);
    setPickerTarget(null);
  };



  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('short_description', shortDescription);
      formData.append('priority', String(priority));
      formData.append('is_active', String(isActive));
      formData.append('hero_caption', heroCaption);
      if (heroBgDesktop) formData.append('hero_bg_desktop', String(heroBgDesktop));
      if (heroBgMobile) formData.append('hero_bg_mobile', String(heroBgMobile));
      if (teamHeadId) formData.append('team_head_id', String(teamHeadId));
      if (logo) formData.append('logo', logo);

      if (initial?.id) {
        await api.patch(`/api/departments/${initial.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/departments/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSaved();
    } catch (err) {
      console.error("Department save failed:", err);
      alert("Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="department-form">
      <div className="department-form__group">
        <label className="department-form__label">
          <FiLayers />
          Department Title *
        </label>
        <Input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          placeholder="Enter department name"
          className="department-form__input"
        />
      </div>

      <div className="department-form__group">
        <label className="department-form__label">
          <FiUpload />
          Department Logo
        </label>
        <div className="department-logo-upload">
          {logoPreview ? (
            <div className="logo-preview-container">
              <img src={logoPreview} alt="Logo Preview" className="logo-preview" />
              <button 
                type="button" 
                onClick={() => { setLogo(null); setLogoPreview(''); }}
                className="logo-remove-btn"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <label className="logo-upload-label">
              <FiUpload className="upload-icon" />
              <span>Click to upload logo</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoChange}
                className="hidden" 
              />
            </label>
          )}
        </div>
      </div>

      <div className="department-form__group">
        <label className="department-form__label department-form__label--block">
          Short Description
        </label>
        <textarea
          value={shortDescription}
          onChange={e => setShortDescription(e.target.value)}
          rows={3}
          className="department-form__textarea"
          placeholder="Brief description of the department"
        />
      </div>



      {/* Team Head Selection */}
      <div className="department-form__group">
        <label className="department-form__label">
          <FiUsers />
          Assign Team Head
        </label>
        <select
          value={teamHeadId ?? ""}
          onChange={(e) =>
            setTeamHeadId(e.target.value ? Number(e.target.value) : null)
          }
          className="department-form__select"
        >
          <option value="" className="department-form__select-option--placeholder">Select a service head (optional)</option>
          {teamHeads.map(head => (
            <option key={head.id} value={head.id} className="department-form__select-option">
              {head.username} ({head.email})
            </option>
          ))}
        </select>
      </div>

      {/* Priority Input */}
      <div className="department-form__group">
        <label className="department-form__label">
          Display Priority (lower = higher priority)
        </label>
        <Input 
          type="number"
          min="1"
          value={priority} 
          onChange={e => setPriority(Number(e.target.value))} 
          required 
          placeholder="Enter priority number (e.g., 1, 2, 3...)"
          className="department-form__input"
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Lower numbers appear first. Each department must have a unique priority.
        </p>
      </div>

      {/* Hero Section Management */}
      <div className="department-form__divider" style={{ margin: '2rem 0', height: '1px', background: '#e5e7eb' }}></div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiImage /> Hero Section Settings
      </h3>

      <div className="department-form__group">
        <label className="department-form__label">
          <FiType />
          Hero Caption
        </label>
        <Input 
          value={heroCaption} 
          onChange={e => setHeroCaption(e.target.value)} 
          placeholder="e.g. Empowering Your Digital Future"
          className="department-form__input"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="department-form__group">
          <label className="department-form__label">
            <FiImage />
            Desktop Hero Background
          </label>
          <div className="media-selector" style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#f9fafb' }}>
            {heroBgDesktopPreview ? (
              <div style={{ position: 'relative', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <img src={heroBgDesktopPreview} alt="Desktop Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => { setHeroBgDesktop(null); setHeroBgDesktopPreview(''); }}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                No Desktop Asset
              </div>
            )}
            <Button type="button" size="sm" variant="outline" onClick={() => openPicker('desktop')} style={{ width: '100%' }}>
              Pick from Library
            </Button>
          </div>
        </div>

        <div className="department-form__group">
          <label className="department-form__label">
            <FiImage />
            Mobile Hero Background
          </label>
          <div className="media-selector" style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#f9fafb' }}>
            {heroBgMobilePreview ? (
              <div style={{ position: 'relative', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <img src={heroBgMobilePreview} alt="Mobile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => { setHeroBgMobile(null); setHeroBgMobilePreview(''); }}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                No Mobile Asset
              </div>
            )}
            <Button type="button" size="sm" variant="outline" onClick={() => openPicker('mobile')} style={{ width: '100%' }}>
              Pick from Library
            </Button>
          </div>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="department-form__toggle-wrapper">
        <div>
          <label className="department-form__toggle-label">Department Status</label>
          <p className="department-form__toggle-description">Enable or disable this department</p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`department-form__toggle-button ${
            isActive ? 'department-form__toggle-button--active' : 'department-form__toggle-button--inactive'
          }`}
        >
          <span
            className={`department-form__toggle-slider ${
              isActive ? 'department-form__toggle-slider--active' : ''
            }`}
          />
        </button>
      </div>

      {/* Submit Button */}
      <div className="department-form__submit-section">
        <Button 
          type="submit" 
          isLoading={loading}
          className="department-form__submit-button"
        >
          {initial ? 'Update Department' : 'Create Department'}
        </Button>
      </div>

      <MediaPickerModal 
        open={pickerOpen} 
        onClose={() => setPickerOpen(false)} 
        onSelect={handleMediaSelect}
        title={pickerTarget === 'desktop' ? "Select Desktop Hero" : "Select Mobile Hero"}
      />
    </form>
  );
}