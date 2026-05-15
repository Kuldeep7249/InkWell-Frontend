import api from './axiosConfig.js';

const AUTH_BASE = '/api/auth';
const ROLE_REQUESTS_BASE = `${AUTH_BASE}/role-requests`;
const ADMIN_USERS_BASE = `${AUTH_BASE}/admin/users`;

async function tryAdminUserMutation(requests) {
  let lastError;
  let triedFallbackOnly = false;

  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status !== 404 && status !== 405) throw error;
      triedFallbackOnly = true;
    }
  }

  if (triedFallbackOnly) {
    const endpointError = new Error('Block/unblock is not available because the backend has no matching admin user endpoint yet.');
    endpointError.code = 'ADMIN_USER_BLOCK_ENDPOINT_MISSING';
    endpointError.cause = lastError;
    throw endpointError;
  }

  throw lastError;
}

function blockStateRequest(id, blocked) {
  const action = blocked ? 'block' : 'unblock';
  const status = blocked ? 'BLOCKED' : 'ACTIVE';

  return tryAdminUserMutation([
    () => api.put(`${ADMIN_USERS_BASE}/${id}/${action}`, undefined, { silentErrors: true }),
    () => api.put(`${ADMIN_USERS_BASE}/${action}/${id}`, undefined, { silentErrors: true }),
    () => api.patch(`${ADMIN_USERS_BASE}/${id}/${action}`, undefined, { silentErrors: true }),
    () => api.patch(`${ADMIN_USERS_BASE}/${action}/${id}`, undefined, { silentErrors: true }),
    () => api.put(`${ADMIN_USERS_BASE}/${id}/status`, { status }, { silentErrors: true }),
    () => api.patch(`${ADMIN_USERS_BASE}/${id}/status`, { status }, { silentErrors: true }),
    () => api.put(`${ADMIN_USERS_BASE}/${id}`, { isBlocked: blocked }, { silentErrors: true }),
    () => api.patch(`${ADMIN_USERS_BASE}/${id}`, { isBlocked: blocked }, { silentErrors: true }),
    () => api.put(`${ADMIN_USERS_BASE}/${id}`, { blocked }, { silentErrors: true }),
    () => api.patch(`${ADMIN_USERS_BASE}/${id}`, { blocked }, { silentErrors: true }),
    () => api.put(`${ADMIN_USERS_BASE}/${id}`, { enabled: !blocked }, { silentErrors: true }),
    () => api.patch(`${ADMIN_USERS_BASE}/${id}`, { enabled: !blocked }, { silentErrors: true }),
    () => api.put(`${ADMIN_USERS_BASE}/${id}`, { active: !blocked }, { silentErrors: true }),
    () => api.patch(`${ADMIN_USERS_BASE}/${id}`, { active: !blocked }, { silentErrors: true })
  ]);
}

export const authApi={
  register:d=>api.post(`${AUTH_BASE}/register`,d),
  requestLoginOtp:d=>api.post(`${AUTH_BASE}/login/request-otp`,d),
  verifyLoginOtp:d=>api.post(`${AUTH_BASE}/login/verify-otp`,d),
  login:d=>api.post(`${AUTH_BASE}/login`,d),
  refresh:refreshToken=>api.post(`${AUTH_BASE}/refresh`,{refreshToken}),
  logout:refreshToken=>api.post(`${AUTH_BASE}/logout`,{refreshToken}),
  profile:()=>api.get(`${AUTH_BASE}/profile`),
  updateProfile:d=>api.put(`${AUTH_BASE}/profile`,d),
  changePassword:d=>api.put(`${AUTH_BASE}/password`,d),
  deactivate:()=>api.put(`${AUTH_BASE}/deactivate`),
  users:()=>api.get(ADMIN_USERS_BASE),
  updateRole:(id,role)=>api.put(`${ADMIN_USERS_BASE}/${id}/role`,{role}),
  blockUser:id=>blockStateRequest(id,true),
  unblockUser:id=>blockStateRequest(id,false),
  requestRole:d=>api.post(ROLE_REQUESTS_BASE,d),
  myRoleRequests:()=>api.get(`${ROLE_REQUESTS_BASE}/me`),
  roleRequests:status=>api.get(`${ROLE_REQUESTS_BASE}/admin`,{params:{status}}),
  approveRoleRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/approve`),
  rejectRoleRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/reject`),
  getProfile:()=>api.get(`${AUTH_BASE}/profile`),
  getUsers:()=>api.get(ADMIN_USERS_BASE),
  updateUserRole:(id,role)=>api.put(`${ADMIN_USERS_BASE}/${id}/role`,{role}),
  blockAdminUser:id=>blockStateRequest(id,true),
  unblockAdminUser:id=>blockStateRequest(id,false),
  createRoleRequest:d=>api.post(ROLE_REQUESTS_BASE,d),
  getMyRoleRequests:()=>api.get(`${ROLE_REQUESTS_BASE}/me`),
  getRoleRequests:status=>api.get(`${ROLE_REQUESTS_BASE}/admin`,{params:{status}}),
  approveRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/approve`),
  rejectRequest:id=>api.put(`${ROLE_REQUESTS_BASE}/admin/${id}/reject`)
};
