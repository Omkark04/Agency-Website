import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback } from '../../api/oauth';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false); // Prevent double processing

  useEffect(() => {
    const processCallback = async () => {
      // Prevent processing twice (React StrictMode or double render)
      if (hasProcessed.current) {
        console.log('⏭️ Skipping duplicate OAuth callback processing');
        return;
      }
      hasProcessed.current = true;

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      // Check for OAuth errors
      if (errorParam) {
        setError('Authentication was cancelled or failed');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Determine provider from state or URL
        const provider = state?.includes('linkedin') ? 'linkedin' : 'google';
        
        console.log('🔐 Processing OAuth callback for:', provider);
        
        // Exchange code for tokens
        const data = await handleOAuthCallback(code, provider);
        
        // Store tokens
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ OAuth authentication successful');
        
        // Redirect to dashboard based on role
        const role = data.user.role;
        if (role === 'admin') {
          navigate('/dashboard/admin');
        } else if (role === 'service_head') {
          navigate('/dashboard/service-head');
        } else if (role === 'team_member') {
          navigate('/dashboard/team-member');
        } else {
          navigate('/client-dashboard');
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {loading ? (
          <>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Authenticating...</h2>
            <p className="text-gray-600">Please wait while we log you in</p>
          </>
        ) : error ? (
          <>
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
