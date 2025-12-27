import { useEffect, useState } from 'react';
import { listDepartments, deleteDepartment } from '../../../api/departments';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import DepartmentForm from './DepartmentForm';
import { 
  FiLayers, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiUsers,
  FiToggleLeft,
  FiToggleRight,
  FiActivity
} from 'react-icons/fi';
import '../../../styles/admin/Departments.css';

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listDepartments();
      setDepartments(res.data);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const onEdit = (d: any) => { setEditing(d); setOpenForm(true); };
  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    await deleteDepartment(id);
    load();
  };

  const filteredDepartments = departments.filter(dept => {
    if (filter === 'all') return true;
    if (filter === 'active') return dept.is_active;
    return !dept.is_active;
  });

  const stats = {
    total: departments.length,
    active: departments.filter(d => d.is_active).length,
    inactive: departments.filter(d => !d.is_active).length,
  };

  return (
    <div className="departments">
      {/* Hero Header */}
      <div className="departments__hero">
        <div className="departments__hero-inner">
          <div className="departments__hero-pattern"></div>
          <div className="departments__hero-content">
            <div className="departments__hero-header">
              <div className="departments__hero-title-wrapper">
                <div className="departments__hero-icon-wrapper">
                  <FiLayers className="departments__hero-icon" />
                </div>
                <div>
                  <h1 className="departments__hero-title">Departments</h1>
                  <p className="departments__hero-subtitle">Manage your organization's departments</p>
                </div>
              </div>
              <Button 
                onClick={() => { setEditing(null); setOpenForm(true); }}
                className="departments__hero-button"
              >
                <FiPlus className="departments__hero-button-icon" />
                Create Department
              </Button>
            </div>
          </div>
          <div className="departments__hero-blur-1"></div>
          <div className="departments__hero-blur-2"></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="departments__stats">
        <div className="departments__stat-card departments__stat-card--total">
          <div className="departments__stat-blur departments__stat-blur--total"></div>
          <div className="departments__stat-content">
            <div className="departments__stat-header">
              <div className="departments__stat-icon-wrapper departments__stat-icon-wrapper--total">
                <FiLayers className="departments__stat-icon" />
              </div>
              <FiActivity className="departments__stat-icon" />
            </div>
            <p className="departments__stat-label">Total Departments</p>
            <p className="departments__stat-value">{stats.total}</p>
          </div>
        </div>
        
        <div className="departments__stat-card departments__stat-card--active">
          <div className="departments__stat-blur departments__stat-blur--active"></div>
          <div className="departments__stat-content">
            <div className="departments__stat-header">
              <div className="departments__stat-icon-wrapper departments__stat-icon-wrapper--active">
                <FiToggleRight className="departments__stat-icon" />
              </div>
              <div className="departments__stat-badge departments__stat-badge--active">
                <span>Active</span>
              </div>
            </div>
            <p className="departments__stat-label">Active</p>
            <p className="departments__stat-value">{stats.active}</p>
          </div>
        </div>
        
        <div className="departments__stat-card departments__stat-card--inactive">
          <div className="departments__stat-blur departments__stat-blur--inactive"></div>
          <div className="departments__stat-content">
            <div className="departments__stat-header">
              <div className="departments__stat-icon-wrapper departments__stat-icon-wrapper--inactive">
                <FiToggleLeft className="departments__stat-icon" />
              </div>
              <div className="departments__stat-badge departments__stat-badge--inactive">
                <span>Inactive</span>
              </div>
            </div>
            <p className="departments__stat-label">Inactive</p>
            <p className="departments__stat-value">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="departments__filters">
        <button
          onClick={() => setFilter('all')}
          className={`departments__filter-btn ${
            filter === 'all'
              ? 'departments__filter-btn--active-all'
              : 'departments__filter-btn--inactive'
          }`}
        >
          <FiLayers />
          All Departments
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`departments__filter-btn ${
            filter === 'active'
              ? 'departments__filter-btn--active-active'
              : 'departments__filter-btn--inactive'
          }`}
        >
          <FiToggleRight />
          Active Only
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`departments__filter-btn ${
            filter === 'inactive'
              ? 'departments__filter-btn--active-inactive'
              : 'departments__filter-btn--inactive'
          }`}
        >
          <FiToggleLeft />
          Inactive Only
        </button>
      </div>

      {/* Table */}
      <div className="departments__table-container">
        {loading ? (
          <div className="departments__loading">
            <div className="departments__loading-spinner-wrapper">
              <div className="departments__loading-spinner"></div>
              <div className="departments__loading-ping"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="departments__table-wrapper">
              <table className="departments__table">
                <thead className="departments__table-head">
                  <tr>
                    <th>
                      Department Details
                    </th>
                    <th>
                      Team Head
                    </th>
                    <th>
                      Status
                    </th>
                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="departments__table-body">
                  {filteredDepartments.map(d => (
                    <tr key={d.id} className="departments__table-row">
                      <td className="departments__table-cell">
                        <div className="departments__dept-info">
                          {d.logo ? (
                            <img 
                              src={d.logo} 
                              alt={d.title} 
                              className="departments__dept-logo"
                            />
                          ) : (
                            <div className="departments__dept-logo-placeholder">
                              <FiLayers className="departments__dept-logo-icon" />
                            </div>
                          )}
                          <div>
                            <div className="departments__dept-title">{d.title}</div>
                            <div className="departments__dept-description">
                              {d.short_description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="departments__table-cell">
                        <div className="departments__team-head">
                          <div className="departments__team-head-icon-wrapper">
                            <FiUsers className="departments__team-head-icon" />
                          </div>
                          <div>
                            <div className="departments__team-head-name">
                              {d.team_head?.username || d.team_head?.email || 'Not assigned'}
                            </div>
                            {d.team_head?.email && (
                              <div className="departments__team-head-email">{d.team_head.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="departments__table-cell">
                        <span className={`departments__status-badge ${
                          d.is_active 
                            ? 'departments__status-badge--active' 
                            : 'departments__status-badge--inactive'
                        }`}>
                          {d.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="departments__table-cell">
                        <div className="departments__actions">
                          <button
                            onClick={() => onEdit(d)}
                            className="departments__action-btn departments__action-btn--edit"
                          >
                            <FiEdit2 />
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(d.id)}
                            className="departments__action-btn departments__action-btn--delete"
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredDepartments.length === 0 && !loading && (
              <div className="departments__empty">
                <div className="departments__empty-icon-wrapper">
                  <FiLayers className="departments__empty-icon" />
                </div>
                <h3 className="departments__empty-title">No departments found</h3>
                <p className="departments__empty-description">
                  {filter === 'all' ? 'Create your first department to get started' :
                   filter === 'active' ? 'No active departments' :
                   'No inactive departments'}
                </p>
                <Button 
                  onClick={() => { setEditing(null); setOpenForm(true); }}
                  className="departments__empty-button"
                >
                  <FiPlus />
                    <p className='departments__empty-button-text'>Create Department</p>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? 'Edit Department' : 'Create Department'}>
        <DepartmentForm initial={editing} onSaved={() => { setOpenForm(false); load(); }} />
      </Modal>
    </div>
  );
};
