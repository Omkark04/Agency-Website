import { useState } from 'react';
import { createClientLogo, updateClientLogo, ClientLogo } from '../../../api/clientLogos';
import api from '../../../api/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FiUpload, FiX, FiLink, FiType } from 'react-icons/fi';

export default function ClientLogoForm({ initial, onSaved }: { initial: ClientLogo | null, onSaved: () => void }) {
  const [caption, setCaption] = useState(initial?.caption || 'Client');
  const [siteLink, setSiteLink] = useState(initial?.site_link || '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initial?.logo || null);

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
    if (!logoFile && !initial?.logo) {
      alert("A client logo is required.");
      return;
    }
    setLoading(true);

    try {
      let logoUrl = initial?.logo || '';

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const uploadRes = await api.post("/api/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        logoUrl = uploadRes.data.url;
      }

      const payload = {
        caption,
        logo: logoUrl, 
        site_link: siteLink || null,
        is_active: isActive,
      };

      if (initial?.id) {
        await updateClientLogo(initial.id, payload);
      } else {
        await createClientLogo(payload);
      }

      onSaved();
    } catch (err) {
      console.error("Client Logo save failed:", err);
      alert("Failed to save client logo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 p-2">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FiType />
          Caption (e.g., Client 1, Microsoft, etc) *
        </label>
        <Input 
          value={caption} 
          onChange={e => setCaption(e.target.value)} 
          required 
          placeholder="Client 1"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FiLink />
          Website Link (Optional)
        </label>
        <Input 
          type="url"
          value={siteLink} 
          onChange={e => setSiteLink(e.target.value)} 
          placeholder="https://example.com"
          className="w-full"
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FiUpload />
          Client Logo *
        </label>
        <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
          {(logoPreview || initial?.logo) && (
            <div className="relative inline-block mb-4">
              <img
                src={logoPreview || initial?.logo}
                alt="Logo preview"
                className="h-24 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
              >
                <FiX className="w-4 h-4" />
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
            <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition">
              <FiUpload className="w-4 h-4" />
              {logoPreview ? 'Change logo' : 'Upload logo (JPG, PNG, SVG)'}
            </label>
          </div>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        <div>
          <label className="font-semibold text-gray-900 dark:text-white">Active Status</label>
          <p className="text-sm text-gray-500">Enable or disable this client logo on the homepage</p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <Button 
          type="submit" 
          isLoading={loading}
          className="px-6"
        >
          {initial ? 'Update Client' : 'Add Client'}
        </Button>
      </div>
    </form>
  );
}
