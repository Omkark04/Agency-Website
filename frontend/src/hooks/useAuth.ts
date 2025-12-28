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

      const response = await api.post('/auth/jwt/login/', {
        email: identifier,
        password
      });

      const { access, refresh } = response.data;
      let { user } = response.data; // Use 'let' to allow modification

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user?.role || ''); // Store role separately

      // ✅ Fetch department for service_head users
      if (user?.role === 'service_head') {

        try {
          const deptResponse = await api.get('/api/user/department/');
          const { department, has_department } = deptResponse.data;
          

          
          if (has_department && department) {
            // Store department in localStorage
            localStorage.setItem('userDepartment', JSON.stringify(department));
            // Add department to user object
            user = { ...user, department }; // Update the user object
            localStorage.setItem('user', JSON.stringify(user));

          } else {
            // No department assigned
            localStorage.setItem('userDepartment', 'null');

          }
        } catch (error) {

          localStorage.setItem('userDepartment', 'null');
        }
      }

      setAuth({ user, loading: false, error: null });
      
      // Role-based redirect
      if (user?.role === 'admin') {
        navigate('/dashboard');
      } else if (user?.role === 'service_head') {
        navigate('/dashboard/service-head');
      } else if (user?.role === 'team_member') {
        navigate('/team-member-dashboard');
      } else if (user?.role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/dashboard'); 
      }

      return { user };

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      setAuth({ user: null, loading: false, error: errorMessage });
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    username: string;
    phone: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      const response = await api.post('/api/auth/register/client/', {
        ...userData,
        password2: userData.password
      });
      const { access, refresh, user } = response.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user?.role || '');

      setAuth({ user, loading: false, error: null });
      
      // Clients always go to client dashboard after registration
      navigate('/client-dashboard');

      return { user };
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