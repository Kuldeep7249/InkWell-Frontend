export default function Loading(){return <div className='grid gap-3'>{[1,2,3].map(i=><div key={i} className='h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800'/>)}</div>;}
