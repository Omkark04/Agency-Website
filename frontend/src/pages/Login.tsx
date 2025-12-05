/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { login } from '../api/auth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const identifier = form.email || form.username;
      const response = await login(identifier, form.password);
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Input label="Email or Username" type="text" value={form.email || form.username} onChange={e => setForm({ ...form, email: e.target.value, username: e.target.value })} required />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button type="button" className="absolute right-2 top-8 text-gray-500" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">👁</button>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <Button type="submit" loading={loading} fullWidth>Login</Button>
        <p className="mt-4 text-center text-sm">
          Don’t have an account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  );
}

