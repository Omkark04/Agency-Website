import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { initiateGoogleAuth, initiateLinkedInAuth } from '@/api/oauth';

type AuthMode = 'login' | 'signup';


interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultMode?: AuthMode;
}


export const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();


  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');


  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
  });


  const isControlled = isOpen !== undefined;


  useEffect(() => {
    if (defaultMode) setMode(defaultMode);
  }, [defaultMode]);


  const toggleModal = () => {
    if (!isControlled) setInternalIsOpen(!internalIsOpen);
    else if (onClose) onClose();
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // ✅ FULLY FIXED SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    try {
      if (mode === 'login') {
        const res = await login(formData.email, formData.password);


        const userRole =
          res?.user?.role ||
          localStorage.getItem('role');
          console.log(userRole);


        if (userRole === 'admin') navigate('/dashboard');
        else if (userRole === 'service_head') navigate('/dashboard/service-head');
        else if (userRole === 'team_member') navigate('/team-member-dashboard');
        else navigate('/client-dashboard');


      } else {
        await register({
          name: formData.name,
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role: 'client',
        });


        navigate('/client-dashboard');
      }


      toggleModal();


      // ✅ RESET FORM AFTER SUCCESS
      setFormData({
        name: '',
        username: '',
        phone: '',
        email: '',
        password: '',
      });


    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };


  if (isControlled && !isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={toggleModal}>
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>


        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={toggleModal}>
            <X size={24} />
          </button>
        </div>


        {/* TABS */}
        <div className="flex border-b">
          <button onClick={() => setMode('login')} className={`flex-1 py-3 ${mode === 'login' && 'border-b-2 border-[#00C2A8]'}`}>
            Sign In
          </button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-3 ${mode === 'signup' && 'border-b-2 border-[#00C2A8]'}`}>
            Sign Up
          </button>
        </div>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6">


          {mode === 'signup' && (
            <>
              <div className="mb-3">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border p-2 rounded" required />
              </div>


              <div className="mb-3">
                <label>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full border p-2 rounded" required />
              </div>


              <div className="mb-3">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border p-2 rounded" pattern="[0-9]{10}" required />
              </div>
            </>
          )}


          <div className="mb-3">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border p-2 rounded" required />
          </div>


          <div className="mb-3 relative">
            <label>Password</label>
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className="w-full border p-2 rounded" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-9">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>


          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}


          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white py-2 rounded">
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* OR DIVIDER */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                {mode === 'login' ? 'Or continue with' : 'Or sign up with'}
              </span>
            </div>
          </div>

          {/* SOCIAL LOGIN BUTTONS */}
          <SocialLoginButtons
            onGoogleLogin={initiateGoogleAuth}
            onLinkedInLogin={initiateLinkedInAuth}
            loading={loading}
          />
        </form>


        {/* FOOTER */}
        <div className="p-4 text-center border-t">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[#00C2A8] font-semibold">
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>


      </div>
    </div>
  );
};


export default AuthModal;
