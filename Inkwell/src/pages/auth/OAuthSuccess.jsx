import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/layout/Layout.jsx';
import { authApi } from '../../api/authApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { unwrap } from '../../utils/helpers.js';
import { tokenStorage } from '../../utils/tokenStorage.js';

function getRedirectTarget(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'AUTHOR') return '/author';
  return '/';
}

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const finishOAuthLogin = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);
      const params = new URLSearchParams(searchParams);

      for (const [key, value] of hashParams.entries()) {
        if (!params.has(key)) params.set(key, value);
      }

      const oauthError = params.get('error') || params.get('oauthError');
      if (oauthError) {
        toast.error(params.get('message') || 'Social sign-in failed');
        navigate('/login', { replace: true });
        return;
      }

      const token = params.get('accessToken') || params.get('token');
      const refreshToken = params.get('refreshToken');
      const userId = params.get('userId');
      const username = params.get('username');
      const email = params.get('email');
      const role = params.get('role');

      if (!token) {
        toast.error('Sign-in response was incomplete');
        navigate('/login', { replace: true });
        return;
      }

      try {
        if (userId && username && email && role) {
          const auth = {
            accessToken: token,
            refreshToken,
            userId: Number(userId),
            username,
            email,
            role
          };
          tokenStorage.set(auth);
          const sessionUser = { userId: auth.userId, username, email, role };
          setUser(sessionUser);
          tokenStorage.setUser(sessionUser);
          toast.success('Logged in successfully');
          navigate(getRedirectTarget(role), { replace: true });
          return;
        }

        tokenStorage.setAccessToken(token);
        const profile = unwrap(await authApi.profile());
        tokenStorage.setUser(profile);
        setUser(profile);
        toast.success('Logged in successfully');
        navigate(getRedirectTarget(profile.role), { replace: true });
      } catch {
        tokenStorage.clear();
        toast.error('Sign-in failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    finishOAuthLogin();
  }, [navigate, setUser]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <h1 className="text-2xl font-bold">Finishing sign-in</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            We are securing your session and redirecting you now.
          </p>
        </div>
      </div>
    </Layout>
  );
}
