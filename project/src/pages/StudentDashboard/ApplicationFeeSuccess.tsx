import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ApplicationFeeSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('Session ID not found in URL.');
        setLoading(false);
        return;
      }
      try {
        const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;
        const EDGE_FUNCTION_ENDPOINT = `${SUPABASE_PROJECT_URL}/functions/v1/verify-stripe-session-application-fee`;
        let token = null;
        try {
          const raw = localStorage.getItem(`sb-${SUPABASE_PROJECT_URL.split('//')[1].split('.')[0]}-auth-token`);
          if (raw) {
            const tokenObj = JSON.parse(raw);
            token = tokenObj?.access_token || null;
          }
        } catch (e) {
          token = null;
        }
        const response = await fetch(EDGE_FUNCTION_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'complete') {
          throw new Error(data.error || data.message || 'Failed to verify session.');
        }
      } catch (err: any) {
        setError(err.message || 'Error verifying payment.');
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto mt-20 bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Verifying Payment...</h1>
        <p className="text-slate-700 mb-4">Please wait while we confirm your transaction. This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-20 bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Application Fee Payment Error</h1>
        <p className="text-slate-700 mb-4">{error}</p>
        <button
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          onClick={() => navigate('/student/dashboard/applications')}
        >
          Back to My Applications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-20 bg-white rounded-2xl shadow-lg p-8 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Application Fee payment successful!</h1>
      <p className="text-slate-700 mb-4">Your application has been processed and is under review. You will receive updates by email.</p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <div className="text-sm text-slate-600 mb-1">Session ID:</div>
        <div className="font-mono text-green-800 text-xs break-all">{sessionId}</div>
      </div>
      <button
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
        onClick={() => navigate('/student/dashboard/applications')}
      >
        Go to My Applications
      </button>
    </div>
  );
};

export default ApplicationFeeSuccess; 