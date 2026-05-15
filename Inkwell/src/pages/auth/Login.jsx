import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/layout/Layout.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const env = import.meta.env;

function stripKnownPath(url = '') {
  return url.replace(/\/(api|auth)(?:\/.*)?$/i, '').replace(/\/+$/, '');
}

function joinUrl(base = '', path = '') {
  if (!base) return '';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function getSocialBaseUrl() {
  return (
    env.VITE_SOCIAL_AUTH_BASE_URL ||
    env.VITE_GATEWAY_API_URL ||
    stripKnownPath(env.VITE_API_BASE_URL || env.VITE_AUTH_API_URL || '')
  );
}

function getRedirectTarget(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'AUTHOR') return '/author';
  return '/';
}

function SocialButton({ href, onClick, label, children }) {
  return (
    <button
      className="btn-muted w-full justify-center border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      onClick={onClick}
      type="button"
      disabled={!href}
    >
      <span className="shrink-0">{children}</span>
      <span>{label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4A9.6 9.6 0 0 0 2.4 12 9.6 9.6 0 0 0 12 21.6c5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1.1-.2-1.5H12Z" />
      <path fill="#34A853" d="M2.4 12c0 1.6.4 3.1 1.2 4.4l3.4-2.7c-.2-.6-.4-1.1-.4-1.7s.1-1.2.4-1.7L3.6 7.6A9.5 9.5 0 0 0 2.4 12Z" />
      <path fill="#4A90E2" d="M12 21.6c2.6 0 4.7-.8 6.3-2.3l-3.1-2.5c-.8.6-1.8.9-3.2.9-2.5 0-4.6-1.7-5.3-4l-3.5 2.7A9.6 9.6 0 0 0 12 21.6Z" />
      <path fill="#FBBC05" d="M6.7 13.7A5.8 5.8 0 0 1 6.3 12c0-.6.1-1.2.3-1.7L3.2 7.6A9.6 9.6 0 0 0 2.4 12c0 1.7.4 3.1 1.2 4.4l3.1-2.7Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 3 1.3 3.7 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-6A4.8 4.8 0 0 1 6.6 8c-.1-.3-.6-1.5.1-3.1 0 0 1-.3 3.3 1.3a11 11 0 0 1 6 0c2.3-1.6 3.3-1.3 3.3-1.3.7 1.6.3 2.8.1 3.1a4.8 4.8 0 0 1 1.3 3.3c0 4.6-2.8 5.7-5.5 6 .4.3.9 1 .9 2.1v3.1c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [otpState, setOtpState] = useState({ challengeId: null, maskedEmail: '', otp: '' });
  const { user, requestLoginOtp, verifyLoginOtp, loading } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const shownOauthError = useRef('');

  const socialBaseUrl = getSocialBaseUrl();
  const googleLoginUrl =
    env.VITE_GOOGLE_LOGIN_URL || joinUrl(socialBaseUrl, '/oauth2/authorization/google');
  const githubLoginUrl =
    env.VITE_GITHUB_LOGIN_URL || joinUrl(socialBaseUrl, '/oauth2/authorization/github');

  useEffect(() => {
    if (user) {
      nav(getRedirectTarget(user.role), { replace: true });
      return;
    }

    const rawHash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    const hashParams = new URLSearchParams(rawHash);
    const searchParams = new URLSearchParams(location.search);
    const hasOAuthPayload =
      searchParams.get('accessToken') ||
      searchParams.get('token') ||
      hashParams.get('accessToken') ||
      hashParams.get('token');

    if (!hasOAuthPayload) return;

    const mergedParams = new URLSearchParams(searchParams);
    for (const [key, value] of hashParams.entries()) {
      if (!mergedParams.has(key)) mergedParams.set(key, value);
    }

    nav(`/oauth2/success?${mergedParams.toString()}`, { replace: true });
  }, [location.hash, location.search, nav, user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');
    const message = params.get('message');
    const toastKey = `${oauthError || ''}:${message || ''}`;

    if (!oauthError || shownOauthError.current === toastKey) return;

    shownOauthError.current = toastKey;
    toast.error(message || 'Social sign-in failed');
  }, [location.search]);

  const submit = async (event) => {
    event.preventDefault();
    const challenge = await requestLoginOtp(form);
    setOtpState({ challengeId: challenge.challengeId, maskedEmail: challenge.maskedEmail, otp: '' });
    toast.success(challenge.message || 'OTP sent to your email');
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    const auth = await verifyLoginOtp({ challengeId: otpState.challengeId, otp: otpState.otp });
    nav(auth.role === 'ADMIN' ? '/admin' : auth.role === 'AUTHOR' ? '/author' : '/');
  };

  const resetOtpFlow = () => {
    setOtpState({ challengeId: null, maskedEmail: '', otp: '' });
  };

  return (
    <Layout>
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md card relative z-10 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl">
          <h1 className="mb-2 text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="mb-8 text-slate-500 dark:text-slate-400">Login to manage your InkWell account.</p>

          {otpState.challengeId ? (
            <form onSubmit={verifyOtp} className="grid gap-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                OTP sent to {otpState.maskedEmail || 'your email'}.
              </div>
              <input
                className="input shadow-sm"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpState.otp}
                onChange={(event) => setOtpState({ ...otpState, otp: event.target.value.replace(/\D/g, '').slice(0, 6) })}
                required
              />
              <button className="btn-primary mt-2 shadow-indigo-600/30" disabled={loading}>
                Verify OTP
              </button>
              <button className="btn-muted" type="button" onClick={resetOtpFlow} disabled={loading}>
                Back to login
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="grid gap-5">
              <input
                className="input shadow-sm"
                placeholder="Email or username"
                value={form.emailOrUsername}
                onChange={(event) => setForm({ ...form, emailOrUsername: event.target.value })}
                required
              />
              <input
                className="input shadow-sm"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
              <button className="btn-primary mt-2 shadow-indigo-600/30" disabled={loading}>Send OTP</button>
            </form>
          )}
          
          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid gap-4">
            <SocialButton href={googleLoginUrl} label="Continue with Google" onClick={() => (window.location.href = googleLoginUrl)}>
              <GoogleIcon />
            </SocialButton>

            <SocialButton href={githubLoginUrl} label="Continue with GitHub" onClick={() => (window.location.href = githubLoginUrl)}>
              <GitHubIcon />
            </SocialButton>
          </div>
          
          <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            New here? <Link className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400" to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
