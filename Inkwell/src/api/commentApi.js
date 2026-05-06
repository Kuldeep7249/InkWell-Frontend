import api from './axiosConfig.js';

const COMMENTS_BASE = '/api/comments';

export const commentApi={
  add:(postId,d)=>api.post(`${COMMENTS_BASE}/posts/${postId}`,d),
  byPost:id=>api.get(`${COMMENTS_BASE}/posts/${id}`),
  get:id=>api.get(`${COMMENTS_BASE}/${id}`),
  replies:id=>api.get(`${COMMENTS_BASE}/${id}/replies`),
  update:(id,d)=>api.put(`${COMMENTS_BASE}/${id}`,d),
  remove:id=>api.delete(`${COMMENTS_BASE}/${id}`),
  approve:id=>api.patch(`${COMMENTS_BASE}/${id}/approve`),
  reject:id=>api.patch(`${COMMENTS_BASE}/${id}/reject`),
  like:id=>api.post(`${COMMENTS_BASE}/${id}/like`),
  unlike:id=>api.delete(`${COMMENTS_BASE}/${id}/like`),
  toggleLike:id=>api.post(`${COMMENTS_BASE}/${id}/like`),
  count:postId=>api.get(`${COMMENTS_BASE}/posts/${postId}/count`),
  addComment:(postId,d)=>api.post(`${COMMENTS_BASE}/posts/${postId}`,d),
  listByPost:id=>api.get(`${COMMENTS_BASE}/posts/${id}`),
  getComment:id=>api.get(`${COMMENTS_BASE}/${id}`),
  listReplies:id=>api.get(`${COMMENTS_BASE}/${id}/replies`),
  updateComment:(id,d)=>api.put(`${COMMENTS_BASE}/${id}`,d),
  deleteComment:id=>api.delete(`${COMMENTS_BASE}/${id}`),
  approveComment:id=>api.patch(`${COMMENTS_BASE}/${id}/approve`),
  rejectComment:id=>api.patch(`${COMMENTS_BASE}/${id}/reject`),
  likeComment:id=>api.post(`${COMMENTS_BASE}/${id}/like`),
  unlikeComment:id=>api.delete(`${COMMENTS_BASE}/${id}/like`),
  toggleLikeComment:id=>api.post(`${COMMENTS_BASE}/${id}/like`),
  getCount:postId=>api.get(`${COMMENTS_BASE}/posts/${postId}/count`)
};
