  import { useState } from 'react';
  import api from '../../../api/api';

  export default function UserForm({ onSaved }: { onSaved: () => void }) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
      username: '',
      email: '',
      password: '',
      phone: '',
      role: 'service_head',
    });

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

        // ✅ REAL BACKEND CALL
        await api.post(endpoint, {
          username: form.username,
          email: form.email,
          password: form.password,
          password2: form.password,
          phone: form.phone,
          role: form.role,
        });

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
              <p className="text-gray-600 text-sm">Admin can create team members & service heads</p>
            </div>

            <div className="space-y-5">

              {/* ✅ ROLE */}
              <div>
                <label className="block text-sm font-semibold mb-1">User Role</label>
                <select
                  className="w-full border p-3 rounded"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="service_head">Service Head</option>
                  <option value="team_member">Team Member</option>
                </select>
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
