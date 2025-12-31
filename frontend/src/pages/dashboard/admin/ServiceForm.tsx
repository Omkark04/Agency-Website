import { useState, useEffect } from 'react';
import { createService, updateService } from '../../../api/services';
import api from '../../../api/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../hooks/useAuth';
import {
  FiPackage,
  FiAlignLeft,
  FiFileText,
  FiLayers,
  FiUpload,
  FiX,
  FiUsers
} from 'react-icons/fi';
import '../../../styles/admin/ServiceForm.css';

export default function ServiceForm({
  initial,
  onSaved,
}: any) {
  const { user } = useAuth();
  const [department, setDepartments] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [title, setTitle] = useState(initial?.title || '');
  const [shortDesc, setShortDesc] = useState(initial?.short_description || '');
  const [longDesc, setLongDesc] = useState(initial?.long_description || '');
  const [departmentId, setDepartmentId] = useState<number | ''>(
    initial?.department || ''
  );
  const [selectedMembers, setSelectedMembers] = useState<number[]>(
    initial?.team_members || []
  );
  const [priority, setPriority] = useState<number>(initial?.priority || 999);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  // ✅ LOGO STATES (MATCHING YOUR DEPARTMENT FORM STYLE)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initial?.logo || null
  );

  const [loading, setLoading] = useState(false);
  
  // Auto-select department for service_head users
  useEffect(() => {
    if (user?.role === 'service_head' && (user as any).department && !initial) {
      const dept = (user as any).department;
      const deptId = typeof dept === 'object' ? dept.id : dept;
      setDepartmentId(deptId);
      console.log('✅ Auto-selected department for service_head:', deptId);
    }
  }, [user, initial]);
  
  useEffect(() => {
    api.get('/api/departments/')
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));
    
    // Load team members
    api.get('/api/auth/admin/users/')
      .then(res => {
        const members = res.data.filter((u: any) => u.role === 'team_member');
        setTeamMembers(members);
      })
      .catch(err => console.error(err));
    
    // Load existing services to show priority conflicts
    api.get('/api/services/')
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);
  // ✅ FILE SELECT
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // ✅ REMOVE LOGO
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById('service-logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // ✅ SUBMIT
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = initial?.logo || null;

      // ✅ Upload new logo if selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);

        const uploadRes = await api.post('/api/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        logoUrl = uploadRes.data.url; // ✅ Cloudinary URL
      }

      const payload = {
        title,
        logo: logoUrl,
        short_description: shortDesc,
        long_description: longDesc,
        department: departmentId === '' ? undefined : departmentId,
        priority,
        is_active: isActive,
        team_members: selectedMembers,
      };

      if (initial?.id) {
        await updateService(initial.id, payload);
      } else {
        await createService(payload);
      }

      onSaved();
    } catch (error) {
      console.error('Service save failed:', error);
      alert('Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="service-form">

      {/* ✅ TITLE */}
      <div className="service-form__group">
        <label className="service-form__label">
          <FiPackage /> Service Title *
        </label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          placeholder="Enter service name"
        />
      </div>

      {/* ✅ SHORT DESCRIPTION */}
      <div className="service-form__group">
        <label className="service-form__label">
          <FiAlignLeft /> Short Description
        </label>
        <textarea
          rows={3}
          value={shortDesc}
          onChange={e => setShortDesc(e.target.value)}
          className="service-form__textarea"
        />
      </div>

      {/* ✅ LONG DESCRIPTION */}
      <div className="service-form__group">
        <label className="service-form__label">
          <FiFileText /> Long Description
        </label>
        <textarea
          rows={5}
          value={longDesc}
          onChange={e => setLongDesc(e.target.value)}
          className="service-form__textarea"
        />
      </div>

      {/* ✅ LOGO UPLOAD */}
      <div className="service-form__group">
        <label className="service-form__label">
          <FiUpload /> Service Logo
        </label>

        {(logoPreview || initial?.logo) && (
          <div className="service-form__logo-preview-wrapper">
            <img
              src={logoPreview || initial?.logo}
              className="service-form__logo-preview"
            />
            <button
              type="button"
              onClick={removeLogo}
              className="service-form__logo-remove"
            >
              <FiX size={14} />
            </button>
          </div>
        )}

        <input
          id="service-logo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="service-form__logo-input"
        />

        <label htmlFor="service-logo-upload" className="service-form__logo-label">
          {logoPreview ? 'Change Logo' : 'Upload Service Logo'}
        </label>
      </div>

      {/* ✅ DEPARTMENT */}
      <div className="service-form__group">
        <label className="service-form__label">
          <FiLayers /> Department *
        </label>
        <select
          value={departmentId}
          onChange={e => setDepartmentId(Number(e.target.value))}
          className="service-form__select"
          required
          disabled={user?.role === 'service_head'} // Read-only for service heads
        >
          <option value="">Select Department</option>
          {department.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        {user?.role === 'service_head' && (
          <p className="service-form__help-text">
            ℹ️ You can only create services for your assigned department
          </p>
        )}
      </div>

      {/* ✅ TEAM MEMBERS */}
      <div className="service-form__group">
        <label className="service-form__label">
          <FiUsers /> Assign Team Members
        </label>
        <select
          multiple
          value={selectedMembers.map(String)}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
            setSelectedMembers(selected);
          }}
          className="service-form__multi-select"
        >
          {teamMembers.map(member => (
            <option key={member.id} value={member.id}>
              {member.username} ({member.email}){member.job_title ? ` - ${member.job_title}` : ''}
            </option>
          ))}
        </select>
        <p className="service-form__help-text">
          Hold Ctrl/Cmd to select multiple team members for this service
        </p>
      </div>

      {/* Priority Input */}
      <div className="service-form__group">
        <label className="service-form__label">
          Display Priority (lower = higher priority)
        </label>
        <Input 
          type="number"
          min="1"
          value={priority} 
          onChange={e => setPriority(Number(e.target.value))} 
          required 
          placeholder="Enter priority number (e.g., 1, 2, 3...)"
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Lower numbers appear first. Each service must have a unique priority.
        </p>
        
        {/* Show existing service priorities */}
        {services.length > 0 && (
          <div style={{ 
            marginTop: '0.75rem', 
            padding: '0.75rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.375rem',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              📋 Existing Service Priorities:
            </p>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {services
                .filter(s => !initial || s.id !== initial.id) // Exclude current service when editing
                .sort((a, b) => a.priority - b.priority)
                .map(service => (
                  <div 
                    key={service.id} 
                    style={{ 
                      fontSize: '0.75rem', 
                      color: service.priority === priority ? '#dc2626' : '#6b7280',
                      fontWeight: service.priority === priority ? '600' : '400',
                      padding: '0.25rem 0',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{service.title}</span>
                    <span style={{ 
                      backgroundColor: service.priority === priority ? '#fee2e2' : '#e5e7eb',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontWeight: '600'
                    }}>
                      Priority: {service.priority}
                    </span>
                  </div>
                ))}
            </div>
            {services.some(s => s.priority === priority && (!initial || s.id !== initial.id)) && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#dc2626', 
                marginTop: '0.5rem',
                fontWeight: '600'
              }}>
                ⚠️ Priority {priority} is already in use!
              </p>
            )}
          </div>
        )}
      </div>

      {/* ✅ STATUS */}
      <div className="service-form__toggle-wrapper">
        <div>
          <p className="service-form__toggle-label">Service Status</p>
          <p className="service-form__toggle-description">Enable or disable service</p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`service-form__toggle-button ${isActive ? 'service-form__toggle-button--active' : 'service-form__toggle-button--inactive'}`}
        >
          <span className={`service-form__toggle-slider ${isActive ? 'service-form__toggle-slider--active' : ''}`} />
        </button>
      </div>

      {/* ✅ SUBMIT */}
      <Button type="submit" isLoading={loading} className="service-form__submit">
        {initial ? 'Update Service' : 'Create Service'}
      </Button>
    </form>
  );
}
