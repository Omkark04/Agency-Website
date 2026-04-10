import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { initiateGoogleAuth, initiateLinkedInAuth } from '@/api/oauth';


type AuthMode = 'login' | 'signup';


interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultMode?: AuthMode;
  onAuthSuccess?: () => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasLowerCase: boolean; // Replaces hasAlphabet
  hasUpperCase: boolean; // New rule
  hasNumber: boolean;
  hasSpecialChar: boolean;
}


export const AuthModal = ({ isOpen, onClose, defaultMode = 'login', onAuthSuccess }: AuthModalProps) => {
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

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Validate password requirements
  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 6,
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

    // Calculate password strength for UI
  const getPasswordStrength = () => {
    if (!formData.password) return { percent: 0, color: 'bg-gray-200', label: '' };
    let score = 0;
    if (passwordValidation.minLength) score++;
    if (passwordValidation.hasLowerCase) score++;
    if (passwordValidation.hasUpperCase) score++;
    if (passwordValidation.hasNumber) score++;
    if (passwordValidation.hasSpecialChar) score++;

    if (score <= 2) return { percent: 33, color: 'bg-red-500', label: 'Weak' };
    if (score <= 4) return { percent: 66, color: 'bg-yellow-500', label: 'Medium' };
    return { percent: 100, color: 'bg-green-500', label: 'Strong' };
  };


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
    
    // Validate password in real-time for signup mode
    if (name === 'password' && mode === 'signup') {
      setPasswordValidation(validatePassword(value));
    }
  };


  // ✅ FULLY FIXED SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password requirements for signup
    if (mode === 'signup') {
      const validation = validatePassword(formData.password);
      const isValid = validation.minLength && validation.hasLowerCase && validation.hasUpperCase && validation.hasNumber && validation.hasSpecialChar;
      
      if (!isValid) {
        setError('Please ensure your password meets all the requirements');
        return;
      }
    }

    try {
      if (mode === 'login') {
        const res = await login(formData.email, formData.password);

        const userRole =
          res?.user?.role ||
          localStorage.getItem('role');
          console.log(userRole);

        // Only navigate if onAuthSuccess is not provided
        if (!onAuthSuccess) {
          if (userRole === 'admin') navigate('/dashboard');
          else if (userRole === 'service_head') navigate('/dashboard/service-head');
          else if (userRole === 'team_member') navigate('/team-member-dashboard');
          else navigate('/client-dashboard');
        }

      } else {
        await register({
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role: 'client',
        });

        // Only navigate if onAuthSuccess is not provided
        if (!onAuthSuccess) {
          navigate('/client-dashboard');
        }
      }

      toggleModal();

      // Call onAuthSuccess callback if provided
      if (onAuthSuccess) {
        onAuthSuccess();
      }

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
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>


        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={toggleModal} className="p-1 hover:bg-gray-100 rounded-lg transition-colors bg-transparent">
            <X size={24} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>


        {/* TABS */}
        <div className="flex border-b flex-shrink-0">
          <button onClick={() => setMode('login')} className={`flex-1 py-3 transition-colors ${mode === 'login' ? 'border-b-2 border-[#015bad] bg-white font-bold text-[#015bad]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
            Sign In
          </button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-3 transition-colors ${mode === 'signup' ? 'border-b-2 border-[#015bad] bg-white font-bold text-[#015bad]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
            Sign Up
          </button>
        </div>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">


          {mode === 'signup' && (
            <>
              <div className="mb-3">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border p-2 rounded bg-white text-gray-900" required />
              </div>


              <div className="mb-3">
                <label>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full border p-2 rounded bg-white text-gray-900" required />
              </div>


              <div className="mb-3">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border p-2 rounded bg-white text-gray-900" pattern="[0-9]{10}" required />
              </div>
            </>
          )}


          <div className="mb-3">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border p-2 rounded bg-white text-gray-900" required />
          </div>


          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                className="w-full border p-2 rounded pr-10 bg-white focus:ring-2 focus:ring-[#015bad] focus:border-transparent outline-none transition-all" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Requirements - Only show in signup mode */}
          {mode === 'signup' && formData.password && (
            <div className="mb-4">
               {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Password Strength</span>
                  <span className={`font-semibold ${getPasswordStrength().color.replace('bg-', 'text-')}`}>
                    {getPasswordStrength().label}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden transition-all">
                  <div 
                    className={`h-full ${getPasswordStrength().color} transition-all duration-500 ease-out`} 
                    style={{ width: `${getPasswordStrength().percent}%` }}
                  />
                </div>
              </div>               <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  <div className={`flex items-center text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.minLength ? <Check size={14} className="mr-1" /> : <div className="w-3.5 h-3.5 mr-1 rounded-full border border-gray-400" />}
                    <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasUpperCase ? <Check size={14} className="mr-1" /> : <div className="w-3.5 h-3.5 mr-1 rounded-full border border-gray-400" />}
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasLowerCase ? <Check size={14} className="mr-1" /> : <div className="w-3.5 h-3.5 mr-1 rounded-full border border-gray-400" />}
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasNumber ? <Check size={14} className="mr-1" /> : <div className="w-3.5 h-3.5 mr-1 rounded-full border border-gray-400" />}
                    <span>One number (0-9)</span>
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasSpecialChar ? <Check size={14} className="mr-1" /> : <div className="w-3.5 h-3.5 mr-1 rounded-full border border-gray-400" />}
                    <span>One special character (!@#$...)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}


          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#015bad] to-[#0A1F44] text-white py-2 rounded">
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* OR DIVIDER */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
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
        <div className="p-4 text-center border-t flex-shrink-0">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[#F5B041] font-semibold bg-transparent hover:bg-transparent px-1 py-0 border-none">
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>


      </div>
    </div>
  );
};


export default AuthModal;
