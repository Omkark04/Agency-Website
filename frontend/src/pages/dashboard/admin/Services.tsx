import { useEffect, useState } from 'react';
import { listServices, deleteService } from '../../../api/services';
import Modal from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import ServiceForm from './ServiceForm';
import { useAuth } from '../../../hooks/useAuth';
import { NoDepartmentMessage } from '../../../components/dashboard/NoDepartmentMessage';
import {
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiLayers,
  FiSearch,
  FiImage
} from 'react-icons/fi';
import '../../../styles/admin/Services.css';

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // ✅ Check if service_head has no department
  const isServiceHeadWithoutDept = user?.role === 'service_head' && !(user as any).department;

  const load = async () => {
    setLoading(true);
    try {
      console.log('🔍 Services: Loading services...');
      console.log('👤 Current user:', user);
      console.log('🏢 User department:', (user as any)?.department);
      
      // Add department filter for service_head users
      const params: any = {};
      if (user?.role === 'service_head' && (user as any).department) {
        const dept = (user as any).department;
        params.department = typeof dept === 'object' ? dept.id : dept;
        console.log('✅ Adding department filter:', params.department);
      } else if (user?.role === 'service_head') {
        console.log('⚠️ Service head has no department - no filter applied');
      } else {
        console.log('ℹ️ User is not service_head - no filter applied');
      }
      
      console.log('📡 API call params:', params);
      const res = await listServices(params);
      console.log('📦 Services received:', res.data.length, 'services');
      setServices(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isServiceHeadWithoutDept && user) {
      load();
    }
  }, [user?.role, (user as any)?.department?.id]); // Only re-run if role or department ID changes

  // ✅ Show empty state if service_head has no department
  if (isServiceHeadWithoutDept) {
    return <NoDepartmentMessage />;
  }

  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await deleteService(id);
    load();
  };

  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.title.toLowerCase().includes(search.toLowerCase()) ||
      service.department_title?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && service.is_active) ||
      (filter === 'inactive' && !service.is_active);

    return matchesSearch && matchesFilter;
  });


  return (
    <div className="services">

      {/* ✅ HEADER */}
      <div className="services__header">
        <div className="services__header-inner">
          <div className="services__header-content">
            <div className="services__header-title-wrapper">
              <FiPackage className="services__header-icon" />
              <div>
                <h1 className="services__header-title">Services</h1>
                <p className="services__header-subtitle">Manage your service offerings</p>
              </div>
            </div>

            <Button
              onClick={() => { setEdit(null); setOpen(true); }}
              className="services__header-button"
            >
              <FiPlus /> Create Service
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ SEARCH + FILTER */}
      <div className="services__controls">
        <div className="services__search-wrapper">
          <FiSearch className="services__search-icon" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or department..."
            className="services__search-input"
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="services__filter-select"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* ✅ SERVICES TABLE */}
      <div className="services__table-container">
        {loading ? (
          <div className="services__loading">Loading...</div>
        ) : (
          <>
            <table className="services__table">
              <thead className="services__table-head">
                <tr>
                  <th>Logo</th>
                  <th>Service</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody className="services__table-body">
                {filteredServices.map(service => (
                  <tr key={service.id}>

                    {/* ✅ LOGO COLUMN */}
                    <td className="services__table-cell">
                      {service.logo ? (
                        <img
                          src={service.logo}
                          alt={service.title}
                          className="services__logo"
                        />
                      ) : (
                        <div className="services__logo-placeholder">
                          <FiImage />
                        </div>
                      )}
                    </td>

                    {/* ✅ TITLE */}
                    <td className="services__table-cell services__title">{service.title}</td>

                    {/* ✅ DEPARTMENT */}
                    <td className="services__table-cell">
                      <div className="services__department">
                        <FiLayers />
                        {service.department_title || 'No department'}
                      </div>
                    </td>

                    {/* ✅ STATUS */}
                    <td className="services__table-cell">
                      <span className={`services__status-badge ${
                        service.is_active
                          ? 'services__status-badge--active'
                          : 'services__status-badge--inactive'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* ✅ ACTIONS */}
                    <td className="services__table-cell services__actions">
                      <button
                        onClick={() => { setEdit(service); setOpen(true); }}
                        className="services__action-btn services__action-btn--edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => onDelete(service.id)}
                        className="services__action-btn services__action-btn--delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {filteredServices.length === 0 && (
              <div className="services__empty">
                No services found
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Service Form">
        <ServiceForm
          initial={edit}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
};

export default Services;
