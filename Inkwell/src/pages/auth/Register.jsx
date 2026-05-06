import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Register(){
  const [form,setForm]=useState({username:'',email:'',password:'',fullName:''});
  const {register}=useAuth(); const nav=useNavigate();
  const submit=async(e)=>{e.preventDefault(); await register(form); nav('/');};
  return <Layout><div className="mx-auto max-w-md card"><h1 className="mb-2 text-3xl font-black">Create your account</h1><p className="mb-6 text-slate-500">Join InkWell as a reader. Request author/admin role later.</p><form onSubmit={submit} className="grid gap-4">{['fullName','username','email','password'].map(k=><input key={k} className="input" type={k==='password'?'password':'text'} placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>) }<button className="btn-primary">Register</button></form><p className="mt-4 text-sm">Already registered? <Link className="text-indigo-600" to="/login">Login</Link></p></div></Layout>;
}
