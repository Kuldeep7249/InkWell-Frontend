import api from './axiosConfig.js';

const TAGS_BASE = '/api/tags';
const POST_TAGS_BASE = '/api/post-tags';

export const tagApi = {
  listTags: () => api.get(TAGS_BASE),
  listTrendingTags: () => api.get(`${TAGS_BASE}/trending`),
  getTag: (id) => api.get(`${TAGS_BASE}/${id}`),
  getTagBySlug: (slug) => api.get(`${TAGS_BASE}/slug/${slug}`),
  createTag: (payload) => api.post(TAGS_BASE, payload),
  updateTag: (id, payload) => api.put(`${TAGS_BASE}/${id}`, payload),
  deleteTag: (id) => api.delete(`${TAGS_BASE}/${id}`),
  getPostTags: (postId) => api.get(`${POST_TAGS_BASE}/${postId}`),
  addTagToPost: (payload) => api.post(POST_TAGS_BASE, payload),
  removeTagFromPost: (payload) => api.delete(POST_TAGS_BASE, { data: payload })
};
