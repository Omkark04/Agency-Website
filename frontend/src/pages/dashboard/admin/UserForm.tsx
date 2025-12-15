  import { useState, useEffect } from 'react';
  import api from '../../../api/api';
  import { useAuth } from '../../../hooks/useAuth';

  export default function UserForm({ onSaved }: { onSaved: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
      username: '',
      email: '',
      password: '',
      phone: '',
      role: user?.role === 'service_head' ? 'team_member' : 'service_head',
    });

    // Auto-set role to team_member for service heads
    useEffect(() => {
      if (user?.role === 'service_head') {
        setForm(prev => ({ ...prev, role: 'team_member' }));
      }
    }, [user]);

    const submit = async () => {
      setLoading(true);

      try {
        let endpoint = '';

        if (form.role === 'service_head') {
          endpoint = '/auth/register/service-head/';
        } else if (form.role === 'team_member') {
          endpoint = '/auth/register/team-member/';
        } else {
          alert('Only Service Head and Team Member can be created here.');
          return;
        }

        // Prepare payload
        const payload: any = {
          username: form.username,
          email: form.email,
          password: form.password,
          password2: form.password,
          phone: form.phone,
          role: form.role,
        };

        // Auto-assign department for service heads creating team members
        if (user?.role === 'service_head' && form.role === 'team_member' && (user as any).department) {
          const dept = (user as any).department;
          payload.department = typeof dept === 'object' ? dept.id : dept;
          console.log('👥 Auto-assigning department to team member:', payload.department);
        }

        // ✅ REAL BACKEND CALL
        await api.post(endpoint, payload);

        alert('User created successfully ✅');
        onSaved();
      } catch (err: any) {
        console.error(err);
        alert(
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          'Failed to create user'
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex items-center justify-center p-6 relative">
        <div className="w-full max-w-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-3xl blur opacity-30 animate-pulse-slow"></div>

          <div className="relative backdrop-blur-xl bg-white/5 border border-gray-200/20 rounded-3xl shadow-2xl p-6">
            {/* HEADER */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Create New User</h2>
              <p className="text-gray-600 text-sm">
                {user?.role === 'service_head' 
                  ? 'Create team members for your department' 
                  : 'Admin can create team members & service heads'}
              </p>
            </div>

            <div className="space-y-5">

              {/* ✅ ROLE */}
              <div>
                <label className="block text-sm font-semibold mb-1">User Role</label>
                <select
                  className="w-full border p-3 rounded"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  disabled={user?.role === 'service_head'} // Disable for service heads
                  required
                >
                  {user?.role === 'admin' && <option value="service_head">Service Head</option>}
                  <option value="team_member">Team Member</option>
                </select>
                {user?.role === 'service_head' && (
                  <p className="text-xs text-gray-500 mt-1">
                    ℹ️ You can only create Team Members for your department
                  </p>
                )}
              </div>

              {/* ✅ USERNAME */}
              <div>
                <label className="block text-sm font-semibold mb-1">Username</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>

              {/* ✅ EMAIL */}
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border p-3 rounded"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* ✅ PHONE */}
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full border p-3 rounded"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </div>

              {/* ✅ PASSWORD WITH VIEW TOGGLE */}
              <div className="relative">
                <label className="block text-sm font-semibold mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border p-3 rounded pr-10"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>

              {/* ✅ SUBMIT */}
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded font-bold hover:opacity-90"
              >
                {loading ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
