import api from './api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
const REDIRECT_URI = window.location.origin + '/auth/callback';

/**
 * Initiate Google OAuth flow
 */
export const initiateGoogleAuth = () => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=openid%20profile%20email&` +
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
    
    const response = await api.post(endpoint, { code });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'OAuth authentication failed');
  }
};
