import api from './axiosConfig.js';

const AUTH_BASE = '/api/auth';
const ROLE_REQUESTS_BASE = `${AUTH_BASE}/role-requests`;
const ADMIN_USERS_BASE = `${AUTH_BASE}/admin/users`;

export const authApi={
  register:d=>api.post(`${AUTH_BASE}/register`,d),
  login:d=>api.post(`${AUTH_BASE}/login`,d),
  refresh:refreshToken=>api.post(`${AUTH_BASE}/refresh`,{refreshToken}),
  logout:refreshToken=>api.post(`${AUTH_BASE}/logout`,{refreshToken}),
  profile:()=>api.get(`${AUTH_BASE}/profile`),
  updateProfile:d=>api.put(`${AUTH_BASE}/profile`,d),
  changePassword:d=>api.put(`${AUTH_BASE}/password`,d),
  deactivate:()=>api.put(`${AUTH_BASE}/deactivate`),
  users:()=>api.get(ADMIN_USERS_BASE),
  updateRole:(id,role)=>api.put(`${ADMIN_USERS_BASE}/${id}/role`,{role}),
  requestRole:d=>api.post(ROLE_REQUESTS_BASE,d),
  myRoleRequests:()=>api.get(`${ROLE_REQUESTS_BASE}/me`),
  roleRequests:status=>api.get(`${ROLE_REQUESTS_BASE}/admin`,{params:{status}}),
  approveRoleRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/approve`),
  rejectRoleRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/reject`),
  getProfile:()=>api.get(`${AUTH_BASE}/profile`),
  getUsers:()=>api.get(ADMIN_USERS_BASE),
  updateUserRole:(id,role)=>api.put(`${ADMIN_USERS_BASE}/${id}/role`,{role}),
  createRoleRequest:d=>api.post(ROLE_REQUESTS_BASE,d),
  getMyRoleRequests:()=>api.get(`${ROLE_REQUESTS_BASE}/me`),
  getRoleRequests:status=>api.get(`${ROLE_REQUESTS_BASE}/admin`,{params:{status}}),
  approveRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/approve`),
  rejectRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/reject`)
};
