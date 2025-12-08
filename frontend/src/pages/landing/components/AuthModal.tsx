import { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Facebook, Twitter, Github } from 'lucide-react';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) => {
  // If the modal is controlled by props, use the defaultMode prop, otherwise manage state internally
  const [mode, setMode] = useState<AuthMode>(defaultMode || 'login');
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = isOpen !== undefined;
  
  const toggleModal = () => {
    if (!isControlled) {
      setInternalIsOpen(!internalIsOpen);
    } else if (onClose) {
      onClose();
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (defaultMode) {
      setMode(defaultMode);
    }
  }, [defaultMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  // If we're in uncontrolled mode and the modal is closed, show the FAB
  if (!isControlled && !internalIsOpen) {
    return (
      <button 
        onClick={() => {
          setMode('login');
          setInternalIsOpen(true);
        }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <LogIn size={24} />
      </button>
    );
  }
  
  // If we're in controlled mode and isOpen is false, don't render anything
  if (isControlled && !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={isControlled ? onClose : toggleModal}>
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button 
            onClick={isControlled ? onClose : toggleModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 font-medium text-sm ${
              mode === 'login'
                ? 'text-[#00C2A8] border-b-2 border-[#00C2A8]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 font-medium text-sm ${
              mode === 'signup'
                ? 'text-[#00C2A8] border-b-2 border-[#00C2A8]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {mode === 'signup' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#00C2A8] focus:border-[#00C2A8] dark:bg-gray-700 dark:text-white"
                  placeholder="John Doe"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#00C2A8] focus:border-[#00C2A8] dark:bg-gray-700 dark:text-white"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#00C2A8] focus:border-[#00C2A8] dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {mode === 'login' && (
              <div className="text-right mt-1">
                <a href="#" className="text-sm text-[#00C2A8] hover:underline">
                  Forgot password?
                </a>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity duration-200 flex items-center justify-center"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
            <LogIn className="ml-2 h-4 w-4" />
          </button>
        </form>

        {/* Social Login */}
        <div className="px-6 pb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Github className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Twitter className="h-5 w-5 text-blue-400" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-lg">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                if (!isControlled) {
                  setInternalIsOpen(true);
                }
              }}
              className="text-[#00C2A8] font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;