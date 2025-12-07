import { useState } from 'react';
import { createService, updateService } from '../../../api/services';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FiPackage, FiAlignLeft, FiFileText, FiLayers } from 'react-icons/fi';

export default function ServiceForm({
  initial,
  onSaved,
  departments = [],
}: any) {
  const [title, setTitle] = useState(initial?.title || '');
  const [shortDesc, setShortDesc] = useState(initial?.short_description || '');
  const [longDesc, setLongDesc] = useState(initial?.long_description || '');
  const [departmentId, setDepartmentId] = useState(initial?.department || '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        short_description: shortDesc,
        long_description: longDesc,
        department: departmentId,
        is_active: isActive,
      };

      if (initial) {
        await updateService(initial.id, payload);
      } else {
        await createService(payload);
      }

      onSaved();
    } catch (error) {
      console.error('Failed to save service:', error);
      alert('Failed to save service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 p-1">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiPackage />
            Service Title *
          </label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Enter service name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiAlignLeft />
            Short Description
          </label>
          <textarea
            placeholder="Brief description of the service"
            value={shortDesc}
            onChange={e => setShortDesc(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiFileText />
            Long Description
          </label>
          <textarea
            placeholder="Detailed description of the service"
            value={longDesc}
            onChange={e => setLongDesc(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiLayers />
            Department *
          </label>
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
            required
          >
            <option value="" className="text-gray-400">Select a department</option>
            {departments.length > 0 ? (
              departments.map((d: any) => (
                <option key={d.id} value={d.id} className="py-2">
                  {d.title}
                </option>
              ))
            ) : (
              <option disabled className="text-gray-400">No departments available</option>
            )}
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Status</label>
            <p className="text-sm text-gray-500">Enable or disable this service</p>
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
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Button 
          type="submit" 
          isLoading={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {initial ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
}