import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { notificationApi } from '../../api/notificationApi.js';
import { adminItems } from './AdminDashboard.jsx';

export default function AdminNotifications(){
  const [form,setForm]=useState({recipientId:'',actorId:'',type:'SYSTEM_ALERT',title:'',message:'',relatedId:'',relatedType:'USER'});
  const send=async(e)=>{e.preventDefault(); await notificationApi.send({...form,recipientId:Number(form.recipientId),actorId:form.actorId?Number(form.actorId):null,relatedId:form.relatedId?Number(form.relatedId):null}); toast.success('Notification sent');};
  return <DashboardLayout title="Send notification" items={adminItems}><form onSubmit={send} className="card grid gap-4 max-w-2xl">{['recipientId','actorId','type','title','message','relatedId','relatedType'].map(k=><input key={k} className="input" placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>) }<button className="btn-primary">Send notification</button></form></DashboardLayout>;
}
