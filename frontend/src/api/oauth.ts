import api from './api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
// Use environment variable for redirect URI, fallback to window.location.origin
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
const REDIRECT_URI = FRONTEND_URL + '/auth/callback';

/**
 * Initiate Google OAuth flow
 */
export const initiateGoogleAuth = () => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=openid%20profile%20email&` +
    `state=google&` +  // Add state to identify provider
    `access_type=online`;
  
  window.location.href = googleAuthUrl;
};

/**
 * Initiate LinkedIn OAuth flow
 */
export const initiateLinkedInAuth = () => {
  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `client_id=${LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `state=linkedin&` +  // Add state to identify provider
    `scope=openid%20profile%20email`;
  
  window.location.href = linkedInAuthUrl;
};

/**
 * Handle OAuth callback and exchange code for JWT tokens
 */
export const handleOAuthCallback = async (code: string, provider: 'google' | 'linkedin') => {
  try {
    const endpoint = provider === 'google' 
      ? '/api/auth/google/callback/'
      : '/api/auth/linkedin/callback/';
    
    const response = await api.post(endpoint, { 
      code,
      redirect_uri: REDIRECT_URI  // Send the same redirect_uri used in the OAuth request
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'OAuth authentication failed');
  }
};
