import { useState, useEffect } from 'react';
import { createService, updateService } from '../../../api/services';
import api from '../../../api/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
  FiPackage,
  FiAlignLeft,
  FiFileText,
  FiLayers,
  FiUpload,
  FiX
} from 'react-icons/fi';

export default function ServiceForm({
  initial,
  onSaved,
  departments = [],
}: any) {
  const [department, setDepartments] = useState<any[]>([]);
  const [title, setTitle] = useState(initial?.title || '');
  const [shortDesc, setShortDesc] = useState(initial?.short_description || '');
  const [longDesc, setLongDesc] = useState(initial?.long_description || '');
  const [departmentId, setDepartmentId] = useState<number | ''>(
    initial?.department || ''
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  // ✅ LOGO STATES (MATCHING YOUR DEPARTMENT FORM STYLE)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initial?.logo || null
  );

  const [loading, setLoading] = useState(false);
    useEffect(() => {
    api.get('/api/departments/')
      .then(res => setDepartments(res.data))
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
        is_active: isActive,
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
    <form onSubmit={submit} className="space-y-6 p-1">

      {/* ✅ TITLE */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
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
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
          <FiAlignLeft /> Short Description
        </label>
        <textarea
          rows={3}
          value={shortDesc}
          onChange={e => setShortDesc(e.target.value)}
          className="w-full border rounded p-3"
        />
      </div>

      {/* ✅ LONG DESCRIPTION */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
          <FiFileText /> Long Description
        </label>
        <textarea
          rows={5}
          value={longDesc}
          onChange={e => setLongDesc(e.target.value)}
          className="w-full border rounded p-3"
        />
      </div>

      {/* ✅ LOGO UPLOAD */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
          <FiUpload /> Service Logo
        </label>

        {(logoPreview || initial?.logo) && (
          <div className="relative inline-block mb-3">
            <img
              src={logoPreview || initial?.logo}
              className="w-24 h-24 object-cover rounded border"
            />
            <button
              type="button"
              onClick={removeLogo}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
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
          className="hidden"
        />

        <label htmlFor="service-logo-upload" className="cursor-pointer block border-dashed border p-3 rounded text-center text-sm">
          {logoPreview ? 'Change Logo' : 'Upload Service Logo'}
        </label>
      </div>

      {/* ✅ DEPARTMENT */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
          <FiLayers /> Department *
        </label>
        <select
          value={departmentId}
          onChange={e => setDepartmentId(Number(e.target.value))}
          className="w-full border rounded p-3"
          required
        >
          <option value="">Select Department</option>
          {department.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ STATUS */}
      <div className="flex items-center justify-between border p-4 rounded">
        <div>
          <p className="font-semibold">Service Status</p>
          <p className="text-sm text-gray-500">Enable or disable service</p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`w-11 h-6 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`block w-4 h-4 bg-white rounded-full transform transition ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* ✅ SUBMIT */}
      <Button type="submit" isLoading={loading} className="w-full">
        {initial ? 'Update Service' : 'Create Service'}
      </Button>
    </form>
  );
}
