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
      const res = await api.get('/auth/admin/users/');
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
    <form onSubmit={submit} className="space-y-6 p-1">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FiLayers />
          Department Title *
        </label>
        <Input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          placeholder="Enter department name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Short Description
        </label>
        <textarea
          value={shortDescription}
          onChange={e => setShortDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          placeholder="Brief description of the department"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FiUpload />
          Department Logo
        </label>
        <div className="space-y-3">
          {(logoPreview || initial?.logo) && (
            <div className="relative inline-block">
              <img
                src={logoPreview || initial?.logo}
                alt="Logo preview"
                className="w-24 h-24 rounded-lg object-cover border border-gray-300"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )}
          <div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                <FiUpload className="text-gray-400" />
                <span className="text-gray-600">
                  {logoPreview ? 'Change logo' : 'Upload logo (JPG, PNG, GIF)'}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Team Head Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FiUsers />
          Assign Team Head
        </label>
        <select
          value={teamHeadId ?? ""}
          onChange={(e) =>
            setTeamHeadId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
        >
          <option value="" className="text-gray-400">Select a service head (optional)</option>
          {teamHeads.map(head => (
            <option key={head.id} value={head.id} className="py-2">
              {head.username} ({head.email})
            </option>
          ))}
        </select>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Department Status</label>
          <p className="text-sm text-gray-500">Enable or disable this department</p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button 
          type="submit" 
          isLoading={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
        >
          {initial ? 'Update Department' : 'Create Department'}
        </Button>
      </div>
    </form>
  );
}