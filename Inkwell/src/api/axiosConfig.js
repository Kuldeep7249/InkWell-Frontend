import axios from 'axios';
import { toast } from 'sonner';
import { tokenStorage } from '../utils/tokenStorage.js';

const env = import.meta.env;
const DEFAULT_ORIGIN = 'http://localhost';

function stripKnownPath(url = '') {
  return url.replace(/\/(api|notification-api)(?:\/.*)?$/i, '');
}

function joinUrl(base = '', path = '') {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

const gatewayBase =
  env.VITE_GATEWAY_API_URL ||
  stripKnownPath(
    env.VITE_API_BASE_URL ||
    env.VITE_POST_API_URL ||
    env.VITE_AUTH_API_URL ||
    env.VITE_CATEGORY_API_URL ||
    env.VITE_COMMENT_API_URL ||
    env.VITE_MEDIA_API_URL ||
    env.VITE_NOTIFICATION_API_URL ||
    ''
  );

const gatewayMode = Boolean(gatewayBase);

const serviceBaseUrls = {
  auth: env.VITE_AUTH_API_URL || env.VITE_API_BASE_URL || `${DEFAULT_ORIGIN}:8080`,
  posts: env.VITE_POST_API_URL || `${DEFAULT_ORIGIN}:8082`,
  comments: env.VITE_COMMENT_API_URL || `${DEFAULT_ORIGIN}:8083`,
  categories: env.VITE_CATEGORY_API_URL || `${DEFAULT_ORIGIN}:8081`,
  categoryTaxonomy:
    env.VITE_CATEGORY_TAXONOMY_API_URL ||
    joinUrl(stripKnownPath(env.VITE_CATEGORY_API_URL || '') || gatewayBase || `${DEFAULT_ORIGIN}:8088`, '/api'),
  media: env.VITE_MEDIA_API_URL || `${DEFAULT_ORIGIN}:8085`,
  notifications: env.VITE_NOTIFICATION_API_URL || `${DEFAULT_ORIGIN}:8087`
};

function resolveServiceBaseUrl(url = '') {
  if (/^https?:\/\//i.test(url)) return undefined;
  if (gatewayMode && (url.startsWith('/api/') || url.startsWith('/notification-api/') || url.startsWith('/files/'))) {
    return gatewayBase;
  }

  if (url.startsWith('/api/auth')) return serviceBaseUrls.auth;
  if (url.startsWith('/api/posts')) return serviceBaseUrls.posts;
  if (url.startsWith('/api/comments')) return serviceBaseUrls.comments;
  if (url.startsWith('/api/post-categories') || url.startsWith('/api/post-tags')) {
    return serviceBaseUrls.categoryTaxonomy;
  }
  if (url.startsWith('/api/categories') || url.startsWith('/api/tags')) {
    return serviceBaseUrls.categories;
  }
  if (url.startsWith('/api/media')) return serviceBaseUrls.media;
  if (url.startsWith('/api/notifications')) return serviceBaseUrls.notifications;

  return serviceBaseUrls.auth;
}

export const api = axios.create();

function extractErrorMessage(data, fallbackMessage) {
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;

  if (data && typeof data === 'object') {
    const values = Object.values(data)
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value) => typeof value === 'string' && value.trim());

    if (values.length) return values[0];
  }

  return fallbackMessage;
}

api.interceptors.request.use((config)=>{
  config.baseURL = resolveServiceBaseUrl(config.url);
  const token=tokenStorage.getAccess();
  if(token) config.headers.Authorization=`Bearer ${token}`;
  return config;
});

api.interceptors.response.use(r=>r, e=>{
  const status=e?.response?.status;
  const msg=extractErrorMessage(e?.response?.data, e?.message);
  const silentErrors = Boolean(e?.config?.silentErrors);
  if(status===401){
    tokenStorage.clear();
    if(location.pathname!=='/login') location.href='/login';
  } else if(status===403 && !silentErrors) {
    toast.error('Access denied');
  } else if(msg && !silentErrors) {
    toast.error(typeof msg==='string'?msg:'Request failed');
  }
  return Promise.reject(e);
});
export default api;
