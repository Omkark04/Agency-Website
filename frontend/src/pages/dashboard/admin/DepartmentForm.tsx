import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { createDepartment, updateDepartment } from '../../../api/departments';
import { uploadMedia } from '../../../api/media';

export default function DepartmentForm({ initial, onSaved }: { initial?: any; onSaved: ()=>void }) {
  const [form, setForm] = useState({ title: '', short_description: '', logo: '', team_head: null, is_active: true });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const handleUpload = async () => {
    if (!file) return;
    const res = await uploadMedia(file);
    return res.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let logoUrl = form.logo;
      if (file) {
        logoUrl = (await handleUpload()) || logoUrl;
      }

      const payload = { ...form, logo: logoUrl };
      if (initial?.id) {
        await updateDepartment(initial.id, payload);
      } else {
        await createDepartment(payload);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Logo (upload)</span>
        <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-1"/>
      </label>
      <Input label="Short Description" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} />
      <div className="flex items-center space-x-2">
        <input id="active" type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
        <label htmlFor="active">Active</label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={saving}>Save</Button>
      </div>
    </form>
  );
}
