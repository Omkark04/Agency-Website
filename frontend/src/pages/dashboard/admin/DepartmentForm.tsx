import { useEffect, useState } from 'react';
import { createDepartment, updateDepartment } from '../../../api/departments';
import api from '../../../api/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
  FiLayers,
  FiUsers,
  FiUpload,
  FiX
} from 'react-icons/fi';
import '../../../styles/admin/DepartmentForm.css';

export default function DepartmentForm({ initial, onSaved }: any) {
  const [title, setTitle] = useState(initial?.title || '');
  const [shortDescription, setShortDescription] = useState(initial?.short_description || '');
  const [teamHeadId, setTeamHeadId] = useState<number | null>(
    initial?.team_head?.id || null
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [teamHeads, setTeamHeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initial?.logo || null);

  useEffect(() => {
    const loadHeads = async () => {
      const res = await api.get('/api/auth/admin/users/');
      const serviceHeads = res.data.filter((u: any) => u.role === 'service_head');
      setTeamHeads(serviceHeads);
    };
    loadHeads();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = initial?.logo || null;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const uploadRes = await api.post("/api/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        logoUrl = uploadRes.data.url;
      }

      const payload = {
        title,
        logo: logoUrl, 
        short_description: shortDescription,
        team_head_id: teamHeadId || null,
        is_active: isActive,
      };

      if (initial?.id) {
        await updateDepartment(initial.id, payload);
      } else {
        await createDepartment(payload);
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

      {/* Logo Upload */}
      <div className="department-form__group">
        <label className="department-form__label">
          <FiUpload />
          Department Logo
        </label>
        <div className="department-form__logo-section">
          {(logoPreview || initial?.logo) && (
            <div className="department-form__logo-preview-wrapper">
              <img
                src={logoPreview || initial?.logo}
                alt="Logo preview"
                className="department-form__logo-preview"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="department-form__logo-remove"
              >
                <FiX className="department-form__logo-remove-icon" />
              </button>
            </div>
          )}
          <div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="department-form__logo-input"
            />
            <label htmlFor="logo-upload" className="department-form__logo-label">
              <div className="department-form__logo-upload-area">
                <FiUpload className="department-form__logo-upload-icon" />
                <span className="department-form__logo-upload-text">
                  {logoPreview ? 'Change logo' : 'Upload logo (JPG, PNG, GIF)'}
                </span>
              </div>
            </label>
          </div>
        </div>
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
    </form>
  );
}