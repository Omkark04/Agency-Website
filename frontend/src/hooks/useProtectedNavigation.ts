// frontend/src/hooks/useProtectedNavigation.ts
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useState } from 'react';

/**
 * Hook to handle navigation with authentication check
 * Redirects to login if user is not authenticated
 */
export const useProtectedNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  /**
   * Navigate to a path, checking authentication first
   * @param path - The path to navigate to
   * @param requiresAuth - Whether the path requires authentication (default: true)
   */
  const navigateTo = (path: string, requiresAuth: boolean = true) => {
    if (requiresAuth && !user) {
      // User is not authenticated, show auth modal
      setShowAuthModal(true);
      return;
    }
    
    // User is authenticated or path doesn't require auth
    navigate(path);
  };

  /**
   * Check if a path requires authentication
   * Public paths: /, /help, /privacy, /terms, /faq, /blog, /blog/:id
   * Protected paths: /dashboard/*, /client-dashboard/*, /offers, /portfolio
   */
  const isProtectedPath = (path: string): boolean => {
    const publicPaths = ['/', '/help', '/privacy', '/terms', '/faq'];
    const publicPrefixes = ['/blog'];
    
    // Check exact matches
    if (publicPaths.includes(path)) {
      return false;
    }
    
    // Check prefixes
    if (publicPrefixes.some(prefix => path.startsWith(prefix))) {
      return false;
    }
    
    // Everything else is protected
    return true;
  };

  return {
    navigateTo,
    isProtectedPath,
    showAuthModal,
    setShowAuthModal,
  };
};
