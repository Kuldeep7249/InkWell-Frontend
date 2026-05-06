import api from './axiosConfig.js';

const NOTIFICATIONS_BASE = '/api/notifications';

export const notificationApi={
  send:d=>api.post(`${NOTIFICATIONS_BASE}/send`,d),
  bulk:d=>api.post(`${NOTIFICATIONS_BASE}/bulk`,d),
  mine:unreadOnly=>api.get(`${NOTIFICATIONS_BASE}/me`,{params:{unreadOnly}}),
  byRecipient:(id,unreadOnly)=>api.get(`${NOTIFICATIONS_BASE}/recipient/${id}`,{params:{unreadOnly}}),
  read:id=>api.put(`${NOTIFICATIONS_BASE}/${id}/read`),
  readAllMine:()=>api.put(`${NOTIFICATIONS_BASE}/me/read-all`),
  readAllByRecipient:id=>api.put(`${NOTIFICATIONS_BASE}/recipient/${id}/read-all`),
  deleteReadMine:()=>api.delete(`${NOTIFICATIONS_BASE}/me/read`),
  deleteReadByRecipient:id=>api.delete(`${NOTIFICATIONS_BASE}/recipient/${id}/read`),
  unreadMine:()=>api.get(`${NOTIFICATIONS_BASE}/me/unread-count`),
  unreadByRecipient:id=>api.get(`${NOTIFICATIONS_BASE}/recipient/${id}/unread-count`),
  remove:id=>api.delete(`${NOTIFICATIONS_BASE}/${id}`),
  email:d=>api.post(`${NOTIFICATIONS_BASE}/email`,d),
  all:()=>api.get(`${NOTIFICATIONS_BASE}/all`),
  sendNotification:d=>api.post(`${NOTIFICATIONS_BASE}/send`,d),
  sendBulk:d=>api.post(`${NOTIFICATIONS_BASE}/bulk`,d),
  getMine:unreadOnly=>api.get(`${NOTIFICATIONS_BASE}/me`,{params:{unreadOnly}}),
  getByRecipient:(id,unreadOnly)=>api.get(`${NOTIFICATIONS_BASE}/recipient/${id}`,{params:{unreadOnly}}),
  markAsRead:id=>api.put(`${NOTIFICATIONS_BASE}/${id}/read`),
  getMyUnreadCount:()=>api.get(`${NOTIFICATIONS_BASE}/me/unread-count`),
  getUnreadCount:id=>api.get(`${NOTIFICATIONS_BASE}/recipient/${id}/unread-count`),
  deleteNotification:id=>api.delete(`${NOTIFICATIONS_BASE}/${id}`),
  sendEmail:d=>api.post(`${NOTIFICATIONS_BASE}/email`,d),
  getAll:()=>api.get(`${NOTIFICATIONS_BASE}/all`)
};
