import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function PostEditor({initial={},categories=[],tags=[],onSubmit}){
  const [title,setTitle]=useState(initial.title||'');
  const [categoryIds,setCategoryIds]=useState(initial.categoryIds||[]);
  const [tagIds,setTagIds]=useState(initial.tagIds||[]);
  const editor=useEditor({extensions:[StarterKit],content:initial.content||'<p></p>'});
  useEffect(()=>{
    setTitle(initial.title||'');
    setCategoryIds(initial.categoryIds||[]);
    setTagIds(initial.tagIds||[]);
    if(editor) editor.commands.setContent(initial.content||'<p></p>');
  },[initial?.id, initial?.title, initial?.content, initial?.categoryIds, initial?.tagIds, editor]);
  const toggle=(arr,set,id)=>set(arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]);
  return <form onSubmit={e=>{e.preventDefault(); onSubmit({title,content:editor?.getHTML()||'',categoryIds,tagIds});}} className="grid gap-4">
    <input className="input text-xl font-bold" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Post title"/>
    <div className="card prose-content min-h-80"><EditorContent editor={editor}/></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card"><h3 className="font-bold">Categories</h3>{categories.map(c=>{const id=c.id||c.categoryId; return <label className="mt-2 block" key={id}><input type="checkbox" checked={categoryIds.includes(id)} onChange={()=>toggle(categoryIds,setCategoryIds,id)}/> {c.name}</label>})}</div>
      <div className="card"><h3 className="font-bold">Tags</h3>{tags.map(t=>{const id=t.id||t.tagId; return <label className="mt-2 block" key={id}><input type="checkbox" checked={tagIds.includes(id)} onChange={()=>toggle(tagIds,setTagIds,id)}/> {t.name}</label>})}</div>
    </div>
    <button className="btn-primary">Save post</button>
  </form>;
}
