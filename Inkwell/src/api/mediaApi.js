import api from './axiosConfig.js';

const MEDIA_BASE = '/api/media';
const mediaBase = import.meta.env.VITE_MEDIA_API_URL || 'http://localhost:8085';

function normalizeUploadOptions(altTextOrOptions, linkedPostId) {
  if (typeof altTextOrOptions === 'object' && altTextOrOptions !== null && !(altTextOrOptions instanceof File)) {
    return {
      altText: altTextOrOptions.altText,
      linkedPostId: altTextOrOptions.linkedPostId
    };
  }

  return { altText: altTextOrOptions, linkedPostId };
}

export function resolveMediaUrl(media) {
  const raw = media?.url ?? media?.fileUrl ?? media?.path ?? media?.filePath ?? media?.downloadUrl ?? '';
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) return raw;

  try {
    const origin = new URL(mediaBase).origin;
    if (raw.startsWith('/')) return `${origin}${raw}`;
    return `${origin}/${raw.replace(/^\.?\//, '')}`;
  } catch {
    return raw;
  }
}

export function getMediaId(media) {
  return media?.mediaId ?? media?.id ?? null;
}

export const mediaApi = {
  uploadMedia: (file, altTextOrOptions, linkedPostId) => {
    const { altText, linkedPostId: normalizedLinkedPostId } = normalizeUploadOptions(altTextOrOptions, linkedPostId);
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (normalizedLinkedPostId != null) formData.append('linkedPostId', normalizedLinkedPostId);
    return api.post(`${MEDIA_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMedia: (id) => api.get(`${MEDIA_BASE}/${id}`),
  listByUploader: (id) => api.get(`${MEDIA_BASE}/uploader/${id}`),
  listByPost: (id) => api.get(`${MEDIA_BASE}/post/${id}`),
  listMineOrAll: () => api.get(`${MEDIA_BASE}/all`),
  listForAdmin: () => api.get(`${MEDIA_BASE}/admin/all`),
  updateAltText: (id, altText) => api.put(`${MEDIA_BASE}/${id}/alt-text`, { altText }),
  linkToPost: (id, postId) => api.post(`${MEDIA_BASE}/${id}/link`, { postId }),
  unlinkFromPost: (id) => api.post(`${MEDIA_BASE}/${id}/unlink`),
  deleteMedia: (id) => api.delete(`${MEDIA_BASE}/${id}`),
  cleanupDeleted: () => api.delete(`${MEDIA_BASE}/admin/cleanup`),

  upload: (file, altTextOrOptions, linkedPostId) => {
    const { altText, linkedPostId: normalizedLinkedPostId } = normalizeUploadOptions(altTextOrOptions, linkedPostId);
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (normalizedLinkedPostId != null) formData.append('linkedPostId', normalizedLinkedPostId);
    return api.post(`${MEDIA_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  get: (id) => api.get(`${MEDIA_BASE}/${id}`),
  byUploader: (id) => api.get(`${MEDIA_BASE}/uploader/${id}`),
  byPost: (id) => api.get(`${MEDIA_BASE}/post/${id}`),
  all: () => api.get(`${MEDIA_BASE}/all`),
  adminAll: () => api.get(`${MEDIA_BASE}/admin/all`),
  alt: (id, altText) => api.put(`${MEDIA_BASE}/${id}/alt-text`, { altText }),
  link: (id, postId) => api.post(`${MEDIA_BASE}/${id}/link`, { postId }),
  unlink: (id) => api.post(`${MEDIA_BASE}/${id}/unlink`),
  remove: (id) => api.delete(`${MEDIA_BASE}/${id}`),
  cleanup: () => api.delete(`${MEDIA_BASE}/admin/cleanup`)
};
