import api from './axiosConfig.js';

const CATEGORIES_BASE = '/api/categories';
const TAGS_BASE = '/api/tags';
const POST_CATEGORIES_BASE = '/api/post-categories';
const POST_TAGS_BASE = '/api/post-tags';

export const categoryApi = {
  listCategories: () => api.get(CATEGORIES_BASE),
  getCategory: (id) => api.get(`${CATEGORIES_BASE}/${id}`),
  getCategoryBySlug: (slug) => api.get(`${CATEGORIES_BASE}/slug/${slug}`),
  listChildren: (id) => api.get(`${CATEGORIES_BASE}/parent/${id}`),
  createCategory: (payload) => api.post(CATEGORIES_BASE, payload),
  updateCategory: (id, payload) => api.put(`${CATEGORIES_BASE}/${id}`, payload),
  deleteCategory: (id) => api.delete(`${CATEGORIES_BASE}/${id}`),
  getPostCategories: (postId) => api.get(`${POST_CATEGORIES_BASE}/${postId}`),
  addCategoryToPost: (payload) => api.post(POST_CATEGORIES_BASE, payload),
  removeCategoryFromPost: (payload) => api.delete(POST_CATEGORIES_BASE, { data: payload }),
  clearPostTaxonomy: (postId) => api.delete(`/api/posts/${postId}/taxonomy`),

  categories: () => api.get(CATEGORIES_BASE),
  category: (id) => api.get(`${CATEGORIES_BASE}/${id}`),
  categoryBySlug: (slug) => api.get(`${CATEGORIES_BASE}/slug/${slug}`),
  children: (id) => api.get(`${CATEGORIES_BASE}/parent/${id}`),
  postCategories: (postId) => api.get(`${POST_CATEGORIES_BASE}/${postId}`),
  clearTaxonomy: (postId) => api.delete(`/api/posts/${postId}/taxonomy`),
  tags: () => api.get(TAGS_BASE),
  trending: () => api.get(`${TAGS_BASE}/trending`),
  tag: (id) => api.get(`${TAGS_BASE}/${id}`),
  tagBySlug: (slug) => api.get(`${TAGS_BASE}/slug/${slug}`),
  createTag: (payload) => api.post(TAGS_BASE, payload),
  updateTag: (id, payload) => api.put(`${TAGS_BASE}/${id}`, payload),
  deleteTag: (id) => api.delete(`${TAGS_BASE}/${id}`),
  addTagToPost: (payload) => api.post(POST_TAGS_BASE, payload),
  removeTagFromPost: (payload) => api.delete(POST_TAGS_BASE, { data: payload }),
  postTags: (postId) => api.get(`${POST_TAGS_BASE}/${postId}`),
  listTags: () => api.get(TAGS_BASE),
  listTrendingTags: () => api.get(`${TAGS_BASE}/trending`),
  getTag: (id) => api.get(`${TAGS_BASE}/${id}`),
  getTagBySlug: (slug) => api.get(`${TAGS_BASE}/slug/${slug}`),
  getPostTags: (postId) => api.get(`${POST_TAGS_BASE}/${postId}`)
};
