import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { authApi } from '../../api/authApi.js';
import { useApi } from '../../hooks/useApi.js';
import { ROLES } from '../../utils/constants.js';
import { adminItems } from './AdminDashboard.jsx';

export default function ManageUsers(){
  const {data,setData}=useApi(()=>authApi.users(),[]);
  const role=async(id,r)=>{const res=await authApi.updateRole(id,r); setData(data.map(u=>u.userId===id?res.data:u)); toast.success('Role updated');};
  return <DashboardLayout title="Manage users" items={adminItems}><div className="grid gap-4">{data?.map(u=><div className="card" key={u.userId}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{u.fullName||u.username}</h3><p className="text-sm text-slate-500">{u.email} • {u.role}</p></div><select className="input max-w-48" value={u.role} onChange={e=>role(u.userId,e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div></div>)}</div></DashboardLayout>;
}
