import { useState } from 'react';
import { toast } from 'sonner';
import { commentApi } from '../../api/commentApi.js';

export default function CommentBox({postId,onAdded,parentCommentId}){
  const [content,setContent]=useState('');
  const [submitting,setSubmitting]=useState(false);

  const submit=async(e)=>{
    e.preventDefault();
    const trimmed=content.trim();
    if(!trimmed || submitting) return;
    setSubmitting(true);
    try{
      await commentApi.add(postId,{content:trimmed,parentCommentId});
      setContent('');
      toast.success(parentCommentId ? 'Reply added' : 'Comment added');
      onAdded?.();
    } catch {
      toast.error(parentCommentId ? 'Unable to add reply' : 'Unable to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return <form onSubmit={submit} className="card">
    <textarea
      className="input min-h-24"
      value={content}
      onChange={e=>setContent(e.target.value)}
      placeholder={parentCommentId ? 'Write a reply...' : 'Write a comment...'}
    />
    <button className="btn-primary mt-3" disabled={submitting || !content.trim()}>
      {submitting ? 'Posting...' : parentCommentId ? 'Post reply' : 'Post comment'}
    </button>
  </form>;
}
