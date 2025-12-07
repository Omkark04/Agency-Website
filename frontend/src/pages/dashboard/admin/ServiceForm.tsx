import { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { createService, updateService } from '../../../api/services';
import { listDepartments } from '../../../api/departments';
import { uploadMedia } from '../../../api/media';

export default function ServiceForm({ initial, onSaved }: any) {
  const [form, setForm] = useState<any>({ title: '', department: '', logo: '', is_active: true });
  const [departments, setDepartments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    listDepartments().then(res => setDepartments(res.data));
    if (initial) setForm(initial);
  }, [initial]);

  const submit = async (e: any) => {
    e.preventDefault();
    let logo = form.logo;
    if (file) {
      const res = await uploadMedia(file);
      logo = res.data.url;
    }
    const payload = { ...form, logo };
    if (initial?.id) await updateService(initial.id, payload);
    else await createService(payload);
    onSaved();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <select className="w-full border p-2 rounded" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
        <option value="">Select Department</option>
        {departments.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
      </select>
      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <Button type="submit">Save</Button>
    </form>
  );
}