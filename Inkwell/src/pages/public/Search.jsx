import { useMemo, useState } from 'react';
import Layout from '../../components/layout/Layout.jsx';
import PostCard from '../../components/blog/PostCard.jsx';
import { useApi } from '../../hooks/useApi.js';
import { postApi } from '../../api/postApi.js';

export default function Search(){
  const [q,setQ]=useState('');
  const {data:posts}=useApi(()=>postApi.public(),[]);
  const filtered=useMemo(()=>posts?.filter(p=>(p.title+p.content).toLowerCase().includes(q.toLowerCase()))||[],[posts,q]);
  return <Layout><div className="mb-6 card"><h1 className="text-3xl font-black">Search posts</h1><input className="input mt-4" placeholder="Search title or content..." value={q} onChange={e=>setQ(e.target.value)}/></div><div className="grid gap-5">{filtered.map(p=><PostCard key={p.id} post={p}/>)}</div></Layout>;
}
