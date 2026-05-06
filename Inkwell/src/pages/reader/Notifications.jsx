import Layout from '../../components/layout/Layout.jsx';
import { notificationApi } from '../../api/notificationApi.js';
import { useApi } from '../../hooks/useApi.js';
import { fmt } from '../../utils/helpers.js';
import { toast } from 'sonner';

export default function Notifications(){
  const {data,setData}=useApi(()=>notificationApi.mine(),[]);
  const mark=async(id)=>{
    await notificationApi.read(id);
    setData(data.map(n=>n.notificationId===id?{...n,read:true,isRead:true}:n));
    window.dispatchEvent(new Event('notifications:refresh'));
    toast.success('Marked as read');
  };
  return <Layout><h1 className="mb-6 text-3xl font-black">Notification center</h1><div className="grid gap-4">{data?.map(n=><div className="card" key={n.notificationId}><div className="flex items-start justify-between"><div><h3 className="font-bold">{n.title}</h3><p className="text-slate-600 dark:text-slate-300">{n.message}</p><p className="mt-2 text-xs text-slate-500">{fmt(n.createdAt)}</p></div>{!n.isRead&&<button onClick={()=>mark(n.notificationId)} className="btn-muted">Mark read</button>}</div></div>)}</div></Layout>;
}
