import { NavLink } from 'react-router-dom';
import Layout from '../layout/Layout.jsx';

export default function DashboardLayout({ title, items = [], children }) {
  return (
    <Layout>
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="card h-fit space-y-1.5 p-5">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Menu
          </p>
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.to === '/admin' || i.to === '/author'}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white'
                }`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </aside>
        <section className="min-w-0">
          <h1 className="mb-8 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {children}
        </section>
      </div>
    </Layout>
  );
}
