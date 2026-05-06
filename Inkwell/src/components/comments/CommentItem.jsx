import { useState } from 'react';
import { toast } from 'sonner';
import { commentApi } from '../../api/commentApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { fmt, unwrap } from '../../utils/helpers.js';
import CommentBox from './CommentBox.jsx';

const getCommentId = (comment) => comment?.commentId ?? comment?.id;
const getParentId = (comment) => comment?.parentCommentId ?? comment?.parentId ?? null;
const getLikeCount = (comment) => comment?.likeCount ?? comment?.likesCount ?? comment?.likes ?? 0;
const getReplyCount = (comment, fallbackReplies = []) => comment?.replyCount ?? comment?.repliesCount ?? fallbackReplies.length;
const getIsLiked = (comment) => Boolean(comment?.likedByCurrentUser ?? comment?.isLiked ?? comment?.liked);
const getChildReplies = (comment) => Array.isArray(comment?.replies) ? comment.replies : [];
const canFallbackToToggle = (error) => {
  const status=error?.response?.status;
  return status === 404 || status === 405 || status === 501;
};

const buildCommentTree = (comments=[]) => {
  if(!Array.isArray(comments)) return [];
  const hasNestedReplies=comments.some(comment=>Array.isArray(comment?.replies) && comment.replies.length);
  const hasFlatParentLinks=comments.some(comment=>getParentId(comment));
  if(hasNestedReplies && !hasFlatParentLinks) return comments;

  const mapped=new Map();
  comments.forEach(comment=>{
    const commentId=getCommentId(comment);
    if(commentId) mapped.set(commentId,{...comment,replies:[]});
  });

  const roots=[];
  comments.forEach(comment=>{
    const commentId=getCommentId(comment);
    const parentId=getParentId(comment);
    const current=mapped.get(commentId) ?? {...comment,replies:[]};
    if(parentId && mapped.has(parentId)){
      mapped.get(parentId).replies.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
};

export default function CommentItem({comment,postId,onRefresh,initialReplies=[]}){
  const {user}=useAuth();
  const [showReplyBox,setShowReplyBox]=useState(false);
  const [showReplies,setShowReplies]=useState(Boolean(initialReplies.length));
  const [loadingReplies,setLoadingReplies]=useState(false);
  const [replies,setReplies]=useState(buildCommentTree(initialReplies));
  const [likePending,setLikePending]=useState(false);
  const [liked,setLiked]=useState(getIsLiked(comment));
  const [likeCount,setLikeCount]=useState(getLikeCount(comment));

  const commentId=getCommentId(comment);
  const childReplies=getChildReplies(comment);
  const visibleReplies=replies.length ? replies : childReplies;
  const replyCount=getReplyCount(comment, visibleReplies);

  const loadReplies = async(force=false) => {
    if(!commentId) return;
    if(visibleReplies.length && !force){
      setShowReplies(true);
      return;
    }
    setLoadingReplies(true);
    try{
      const response=await commentApi.replies(commentId);
      const nextReplies=unwrap(response) || [];
      setReplies(buildCommentTree(nextReplies));
      setShowReplies(true);
    } catch {
      toast.error('Unable to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleLike = async() => {
    if(!user){
      toast.error('Login to like comments');
      return;
    }
    if(likePending || !commentId) return;

    const nextLiked=!liked;
    setLikePending(true);
    setLiked(nextLiked);
    setLikeCount(count=>Math.max(0, count + (nextLiked ? 1 : -1)));

    try{
      if(nextLiked){
        await commentApi.like(commentId);
      } else {
        try{
          await commentApi.unlike(commentId);
        } catch (error) {
          if(!canFallbackToToggle(error)) throw error;
          await commentApi.toggleLike(commentId);
        }
      }
    } catch {
      setLiked(!nextLiked);
      setLikeCount(count=>Math.max(0, count + (nextLiked ? -1 : 1)));
      toast.error('Unable to update like');
    } finally {
      setLikePending(false);
    }
  };

  const handleReplyAdded = async() => {
    setShowReplyBox(false);
    await loadReplies(true);
    onRefresh?.();
  };

  return <div className="card">
    <div className="text-sm text-slate-500">
      {comment.authorUsername||`User #${comment.authorId}`} | {fmt(comment.createdAt)}
    </div>
    <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>

    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      <button type="button" className="btn-muted" onClick={toggleLike} disabled={likePending}>
        {liked ? 'Unlike' : 'Like'} ({likeCount})
      </button>
      {user ? <button type="button" className="btn-muted" onClick={()=>setShowReplyBox(value=>!value)}>
        {showReplyBox ? 'Cancel reply' : 'Reply'}
      </button> : null}
      {replyCount > 0 ? <button type="button" className="btn-muted" onClick={()=>showReplies ? setShowReplies(false) : loadReplies()}>
        {loadingReplies ? 'Loading replies...' : showReplies ? 'Hide replies' : `Show replies (${replyCount})`}
      </button> : null}
    </div>

    {showReplyBox ? <div className="mt-4">
      <CommentBox postId={postId} parentCommentId={commentId} onAdded={handleReplyAdded} />
    </div> : null}

    {showReplies ? <div className="mt-4 grid gap-3 border-l border-slate-200 pl-4 dark:border-slate-700">
      {visibleReplies.map(reply => <CommentItem
        key={getCommentId(reply)}
        comment={reply}
        postId={postId}
        onRefresh={onRefresh}
        initialReplies={getChildReplies(reply)}
      />)}
    </div> : null}
  </div>;
}
