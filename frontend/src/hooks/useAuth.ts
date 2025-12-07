import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access');
        if (token) {
          // You might want to validate the token with the backend
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          setAuth({ user, loading: false, error: null });
        } else {
          setAuth({ user: null, loading: false, error: null });
        }
      } catch (error) {
        setAuth({ user: null, loading: false, error: 'Failed to authenticate' });
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await api.post('/auth/token/', { 
        email: identifier,
        password 
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setAuth({ user, loading: false, error: null });
      navigate('/dashboard');

    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Login failed';
      setAuth(prev => ({ ...prev, error: errorMsg, loading: false }));
      throw new Error(errorMsg);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      const response = await api.post('/auth/register/client/', {
        ...userData,
        password2: userData.password
      });
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuth({ user, loading: false, error: null });
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Registration failed';
      setAuth(prev => ({ ...prev, error: errorMsg, loading: false }));
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setAuth({ user: null, loading: false, error: null });
    navigate('/login');
  };

  return {
    ...auth,
    login,
    register,
    logout,
    isAuthenticated: !!auth.user,
  };
};
