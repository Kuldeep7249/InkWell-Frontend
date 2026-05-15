import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const { register } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => { e.preventDefault(); await register(form); nav('/'); };

  return (
    <Layout>
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md card relative z-10 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl">
          <h1 className="mb-2 text-3xl font-black tracking-tight">Create your account</h1>
          <p className="mb-8 text-slate-500 dark:text-slate-400">Join InkWell as a reader. Request author/admin role later.</p>
          
          <form onSubmit={submit} className="grid gap-5">
            {['fullName', 'username', 'email', 'password'].map(k => (
              <input
                key={k}
                className="input shadow-sm"
                type={k === 'password' ? 'password' : 'text'}
                placeholder={k === 'fullName' ? 'Full Name' : k.charAt(0).toUpperCase() + k.slice(1)}
                value={form[k]}
                onChange={e => setForm({ ...form, [k]: e.target.value })}
                required
              />
            ))}
            <button className="btn-primary mt-2 shadow-indigo-600/30">Register</button>
          </form>
          
          <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Already registered? <Link className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
