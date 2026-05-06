import api from './axiosConfig.js';

const POSTS_BASE = '/api/posts';

function buildLegacyPayload(payload = {}) {
  return {
    title: payload.title,
    content: payload.content
  };
}

function shouldRetryWithLegacyShape(error) {
  const status = error?.response?.status;
  return status === 400 || status === 415;
}

async function createPostCompatible(payload) {
  try {
    return await api.post(POSTS_BASE, payload);
  } catch (error) {
    if (!shouldRetryWithLegacyShape(error)) throw error;
    return api.post(POSTS_BASE, buildLegacyPayload(payload));
  }
}

async function updatePostCompatible(id, payload) {
  try {
    return await api.put(`${POSTS_BASE}/${id}`, payload);
  } catch (error) {
    if (!shouldRetryWithLegacyShape(error)) throw error;
    return api.put(`${POSTS_BASE}/${id}`, buildLegacyPayload(payload));
  }
}

export const postApi = {
  createPost: (payload) => createPostCompatible(payload),
  updatePost: (id, payload) => updatePostCompatible(id, payload),
  getPost: (id) => api.get(`${POSTS_BASE}/${id}`),
  deletePost: (id) => api.delete(`${POSTS_BASE}/${id}`),
  listPublic: () => api.get(`${POSTS_BASE}/public`),
  getPublicById: (id) => api.get(`${POSTS_BASE}/public/${id}`),
  listByUser: (id) => api.get(`${POSTS_BASE}/user/${id}`),
  listForAdmin: () => api.get(`${POSTS_BASE}/admin`),
  listByStatus: (status) => api.get(`${POSTS_BASE}/admin/status/${status}`),
  approvePost: (id) => api.put(`${POSTS_BASE}/admin/${id}/approve`),
  rejectPost: (id) => api.put(`${POSTS_BASE}/admin/${id}/reject`),

  create: (payload) => createPostCompatible(payload),
  public: () => api.get(`${POSTS_BASE}/public`),
  publicById: (id) => api.get(`${POSTS_BASE}/public/${id}`),
  byUser: (id) => api.get(`${POSTS_BASE}/user/${id}`),
  get: (id) => api.get(`${POSTS_BASE}/${id}`),
  update: (id, payload) => updatePostCompatible(id, payload),
  remove: (id) => api.delete(`${POSTS_BASE}/${id}`),
  admin: () => api.get(`${POSTS_BASE}/admin`),
  byStatus: (status) => api.get(`${POSTS_BASE}/admin/status/${status}`),
  approve: (id) => api.put(`${POSTS_BASE}/admin/${id}/approve`),
  reject: (id) => api.put(`${POSTS_BASE}/admin/${id}/reject`),
  getForUser: (id) => api.get(`${POSTS_BASE}/${id}`)
};
