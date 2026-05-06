import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useApi } from '../../hooks/useApi.js';
import { postApi } from '../../api/postApi.js';
import { fmt } from '../../utils/helpers.js';

const items=[{to:'/author',label:'Overview'},{to:'/author/posts',label:'My posts'},{to:'/author/posts/new',label:'Create post'},{to:'/author/media',label:'Media library'}];

export default function MyPosts(){
  const {user}=useAuth();
  const {data,setData}=useApi(()=>postApi.byUser(user.userId),[user.userId]);
  const remove=async(id)=>{if(confirm('Delete this post?')){await postApi.remove(id); setData(data.filter(p=>p.id!==id)); toast.success('Post deleted');}};
  return <DashboardLayout title="My posts" items={items}><div className="mb-4"><Link className="btn-primary" to="/author/posts/new">Create new post</Link></div><div className="grid gap-4">{data?.map(p=><div className="card" key={p.id}><div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-bold">{p.title}</h3><p className="text-sm text-slate-500">{p.status} • {fmt(p.createdAt)}</p></div><div className="flex gap-2"><Link className="btn-muted" to={`/author/posts/${p.id}/edit`}>Edit</Link><button onClick={()=>remove(p.id)} className="btn-muted">Delete</button></div></div></div>)}</div></DashboardLayout>;
}
