import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Layout from '../../components/layout/Layout.jsx';
import { authApi } from '../../api/authApi.js';
import { unwrap } from '../../utils/helpers.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function Profile(){
  const {setUser}=useAuth();
  const [profile,setProfile]=useState({fullName:'',bio:'',avatarUrl:''});
  const [pwd,setPwd]=useState({currentPassword:'',newPassword:''});
  useEffect(()=>{authApi.profile().then(r=>setProfile(unwrap(r)));},[]);
  const save=async(e)=>{e.preventDefault(); const p=unwrap(await authApi.updateProfile(profile)); setProfile(p); setUser(p); toast.success('Profile updated');};
  const change=async(e)=>{e.preventDefault(); await authApi.changePassword(pwd); toast.success('Password changed'); setPwd({currentPassword:'',newPassword:''});};
  return <Layout><div className="grid gap-6 md:grid-cols-2"><form onSubmit={save} className="card grid gap-4"><h1 className="text-3xl font-black">Profile</h1><input className="input" value={profile.fullName||''} onChange={e=>setProfile({...profile,fullName:e.target.value})} placeholder="Full name"/><input className="input" value={profile.avatarUrl||''} onChange={e=>setProfile({...profile,avatarUrl:e.target.value})} placeholder="Avatar URL"/><textarea className="input min-h-32" value={profile.bio||''} onChange={e=>setProfile({...profile,bio:e.target.value})} placeholder="Bio"/><button className="btn-primary">Update profile</button></form><form onSubmit={change} className="card grid gap-4"><h2 className="text-2xl font-black">Change password</h2><input className="input" type="password" placeholder="Current password" value={pwd.currentPassword} onChange={e=>setPwd({...pwd,currentPassword:e.target.value})}/><input className="input" type="password" placeholder="New password" value={pwd.newPassword} onChange={e=>setPwd({...pwd,newPassword:e.target.value})}/><button className="btn-primary self-start">Change password</button></form></div></Layout>;
}
