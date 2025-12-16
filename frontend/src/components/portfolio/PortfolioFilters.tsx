// frontend/src/components/portfolio/PortfolioFilters.tsx
import { Filter, Search } from 'lucide-react';
import type { Department } from '../../api/departments';
import type { Service } from '../../api/services';

interface PortfolioFiltersProps {
  departments: Department[];
  services: Service[];
  selectedDepartment: number | null;
  selectedService: number | null;
  searchTerm: string;
  onDepartmentChange: (departmentId: number | null) => void;
  onServiceChange: (serviceId: number | null) => void;
  onSearchChange: (search: string) => void;
}

export const PortfolioFilters = ({
  departments,
  services,
  selectedDepartment,
  selectedService,
  searchTerm,
  onDepartmentChange,
  onServiceChange,
  onSearchChange
}: PortfolioFiltersProps) => {
  // Filter services based on selected department
  const filteredServices = selectedDepartment
    ? services.filter(s => s.department === selectedDepartment)
    : services;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-[#00C2A8]" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Portfolio</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00C2A8]/20 focus:border-[#00C2A8] transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDepartment || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              onDepartmentChange(value);
              onServiceChange(null); // Reset service when department changes
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00C2A8]/20 focus:border-[#00C2A8] transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.title}
              </option>
            ))}
          </select>
        </div>

        {/* Service Filter */}
        <div>
          <select
            value={selectedService || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              onServiceChange(value);
            }}
            disabled={!selectedDepartment && filteredServices.length === 0}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#00C2A8]/20 focus:border-[#00C2A8] transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Services</option>
            {filteredServices.map(service => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedDepartment || selectedService || searchTerm) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {searchTerm && (
            <span className="px-3 py-1 bg-[#00C2A8]/10 text-[#00C2A8] text-sm rounded-full flex items-center gap-1">
              Search: "{searchTerm}"
              <button onClick={() => onSearchChange('')} className="ml-1 hover:text-[#0066FF]">×</button>
            </span>
          )}
          {selectedDepartment && (
            <span className="px-3 py-1 bg-[#00C2A8]/10 text-[#00C2A8] text-sm rounded-full flex items-center gap-1">
              {departments.find(d => d.id === selectedDepartment)?.title}
              <button onClick={() => onDepartmentChange(null)} className="ml-1 hover:text-[#0066FF]">×</button>
            </span>
          )}
          {selectedService && (
            <span className="px-3 py-1 bg-[#00C2A8]/10 text-[#00C2A8] text-sm rounded-full flex items-center gap-1">
              {services.find(s => s.id === selectedService)?.title}
              <button onClick={() => onServiceChange(null)} className="ml-1 hover:text-[#0066FF]">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioFilters;
