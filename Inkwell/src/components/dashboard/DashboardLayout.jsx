import { Link } from 'react-router-dom';
import Layout from '../layout/Layout.jsx';
export default function DashboardLayout({title,items=[],children}){
  return <Layout><div className="grid gap-6 md:grid-cols-[240px_1fr]">
    <aside className="card h-fit space-y-2">{items.map(i=><Link key={i.to} to={i.to} className="block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">{i.label}</Link>)}</aside>
    <section><h1 className="mb-5 text-3xl font-black">{title}</h1>{children}</section>
  </div></Layout>;
}
