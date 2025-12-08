import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    try {
      await registerUser({
        name: '',
        username: form.username,
        phone: '',
        email: form.email,
        password: form.password,
        role: 'client'
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <Input label="Username" type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button type="button" className="absolute right-2 top-8 text-gray-500" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">👁</button>
        </div>
        <div className="relative">
          <Input label="Confirm Password" type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
          <button type="button" className="absolute right-2 top-8 text-gray-500" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password visibility">👁</button>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <Button type="submit" isLoading={loading} className="w-full">Register</Button>
        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

