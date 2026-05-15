import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { mediaApi } from '../../api/mediaApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useApi } from '../../hooks/useApi.js';
import { unwrap } from '../../utils/helpers.js';

const items=[{to:'/author',label:'Overview'},{to:'/author/posts',label:'My posts'},{to:'/author/posts/new',label:'Create post'},{to:'/author/media',label:'Media library'}];
const mediaBase=import.meta.env.VITE_MEDIA_API_URL || 'http://localhost:8085/api/media';

const getMediaOrigin = () => {
  try{
    return new URL(mediaBase).origin;
  } catch {
    return window.location.origin;
  }
};

const getFileExtension = (value='') => value.split('.').pop()?.toLowerCase() || '';
const imageExtensions=['jpg','jpeg','png','gif','webp','svg','bmp','avif'];
const videoExtensions=['mp4','webm','ogg','mov','m4v'];
const audioExtensions=['mp3','wav','ogg','m4a','aac','flac'];

const resolveMediaUrl = (media) => {
  const raw=media?.url ?? media?.fileUrl ?? media?.path ?? media?.filePath ?? '';
  if(!raw) return '';
  if(/^https?:\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) return raw;

  const origin=getMediaOrigin();
  if(raw.startsWith('/')) return `${origin}${raw}`;

  const normalized=raw.replace(/^\.?\//,'');
  return `${origin}/${normalized}`;
};

const getMediaType = (media) => {
  const explicitType=(media?.contentType ?? media?.mimeType ?? media?.type ?? '').toLowerCase();
  if(explicitType.startsWith('image/')) return 'image';
  if(explicitType.startsWith('video/')) return 'video';
  if(explicitType.startsWith('audio/')) return 'audio';
  if(explicitType.includes('pdf')) return 'pdf';

  const ext=getFileExtension(media?.originalName || media?.filename || media?.name || media?.url || media?.path || '');
  if(imageExtensions.includes(ext)) return 'image';
  if(videoExtensions.includes(ext)) return 'video';
  if(audioExtensions.includes(ext)) return 'audio';
  if(ext === 'pdf') return 'pdf';
  return 'file';
};

function MediaPreview({media}){
  const src=resolveMediaUrl(media);
  const type=getMediaType(media);
  const [failed,setFailed]=useState(false);

  if(!src || failed){
    return <div className="grid h-48 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800">No preview</div>;
  }

  if(type === 'image'){
    return <img src={src} alt={media.altText || media.originalName || media.filename || 'Uploaded media'} className="h-48 w-full rounded-xl object-cover" onError={()=>setFailed(true)} />;
  }

  if(type === 'video'){
    return <video src={src} controls className="h-48 w-full rounded-xl bg-black object-cover" onError={()=>setFailed(true)} />;
  }

  if(type === 'audio'){
    return <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><audio src={src} controls className="w-full" onError={()=>setFailed(true)} /></div>;
  }

  if(type === 'pdf'){
    return <iframe src={src} title={media.originalName || media.filename || 'PDF preview'} className="h-48 w-full rounded-xl border border-slate-200 dark:border-slate-700" onError={()=>setFailed(true)} />;
  }

  return <a href={src} target="_blank" rel="noreferrer" className="grid h-48 place-items-center rounded-xl bg-slate-100 text-sm font-semibold text-indigo-600 dark:bg-slate-800">
    Open file
  </a>;
}

export default function MediaLibrary(){
  const {user}=useAuth(); const [file,setFile]=useState(null); const [altText,setAlt]=useState('');
  const [localPreview,setLocalPreview]=useState('');
  const [deletingId,setDeletingId]=useState(null);
  const {data,setData}=useApi(()=>mediaApi.byUploader(user.userId),[user.userId]);

  useEffect(()=>{
    if(!file){
      setLocalPreview('');
      return;
    }
    const previewUrl=URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    return ()=>URL.revokeObjectURL(previewUrl);
  },[file]);

  const mediaItems=useMemo(()=>{
    const list=unwrap({data}) ?? data;
    return Array.isArray(list) ? list : [];
  },[data]);

  const upload=async(e)=>{
    e.preventDefault();
    if(!file) return;
    const r=await mediaApi.upload(file,altText);
    const uploaded=unwrap(r);
    setData([uploaded,...(mediaItems||[])]);
    setFile(null);
    setAlt('');
    setLocalPreview('');
    toast.success('Media uploaded');
  };

  const removeMedia=async(mediaId)=>{
    try{
      setDeletingId(mediaId);
      await mediaApi.deleteMedia(mediaId);
      setData((current=[])=>current.filter((item)=> (item.mediaId || item.id) !== mediaId));
      toast.success('Media deleted');
    } finally {
      setDeletingId(null);
    }
  };

  return <DashboardLayout title="Media library" items={items}>
    <form onSubmit={upload} className="card mb-6 grid gap-4 md:grid-cols-[1.2fr_1fr_auto]">
      <input className="input" type="file" onChange={e=>setFile(e.target.files[0]||null)}/>
      <input className="input" placeholder="Alt text" value={altText} onChange={e=>setAlt(e.target.value)}/>
      <button className="btn-primary">Upload</button>
      {file ? <div className="md:col-span-3">
        <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Selected file preview</p>
        <MediaPreview media={{url:localPreview,originalName:file.name,mimeType:file.type,altText}} />
      </div> : null}
    </form>

    <div className="grid gap-4 md:grid-cols-3">
      {mediaItems.map(m=>{
        const mediaId=m.mediaId || m.id;
        const busy=deletingId === mediaId;

        return <div className="card" key={mediaId}>
          <MediaPreview media={m} />
          <p className="mt-4 font-bold">{m.originalName||m.filename||m.name||'Untitled media'}</p>
          {m.altText ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.altText}</p> : null}
          <a href={resolveMediaUrl(m)} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-indigo-600">
            {resolveMediaUrl(m)}
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={()=>removeMedia(mediaId)}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Deleting...' : 'Delete'}
          </button>
        </div>;
      })}
    </div>
  </DashboardLayout>;
}
