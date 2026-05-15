import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { authApi } from '../../api/authApi.js';
import { useApi } from '../../hooks/useApi.js';
import { unwrap } from '../../utils/helpers.js';
import { ROLES } from '../../utils/constants.js';
import { adminItems } from './AdminDashboard.jsx';

function isUserBlocked(user) {
  if (typeof user?.isBlocked === 'boolean') return user.isBlocked;
  if (typeof user?.blocked === 'boolean') return user.blocked;
  if (typeof user?.active === 'boolean') return !user.active;
  if (typeof user?.enabled === 'boolean') return !user.enabled;
  if (typeof user?.accountNonLocked === 'boolean') return !user.accountNonLocked;
  if (typeof user?.status === 'string') return user.status.toUpperCase() === 'BLOCKED';
  return false;
}

function statusLabel(user) {
  return isUserBlocked(user) ? 'Blocked' : 'Active';
}

export default function ManageUsers() {
  const { data, setData } = useApi(() => authApi.users(), []);
  const [busyUserId, setBusyUserId] = useState(null);

  const patchUser = (id, nextUser) => {
    setData((current = []) => current.map((user) => (user.userId === id ? nextUser : user)));
  };

  const updateRole = async (id, role) => {
    setBusyUserId(id);
    try {
      const res = await authApi.updateRole(id, role);
      patchUser(id, unwrap(res));
      toast.success('Role updated');
    } finally {
      setBusyUserId(null);
    }
  };

  const toggleBlocked = async (user) => {
    const blocked = isUserBlocked(user);
    setBusyUserId(user.userId);
    try {
      const res = blocked
        ? await authApi.unblockUser(user.userId)
        : await authApi.blockUser(user.userId);
      patchUser(user.userId, unwrap(res));
      toast.success(blocked ? 'User unblocked' : 'User blocked');
    } catch (error) {
      if (error?.code === 'ADMIN_USER_BLOCK_ENDPOINT_MISSING') {
        toast.error('Backend block/unblock endpoint is not implemented yet.');
        return;
      }
      throw error;
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <DashboardLayout title="Manage users" items={adminItems}>
      <div className="grid gap-4">
        {data?.map((user) => {
          const blocked = isUserBlocked(user);
          const busy = busyUserId === user.userId;

          return (
            <div className="card" key={user.userId}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold">{user.fullName || user.username}</h3>
                  <p className="text-sm text-slate-500">
                    {user.email} • {user.role}
                  </p>
                  <p className={`mt-1 text-sm font-medium ${blocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {statusLabel(user)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    className="input max-w-48"
                    value={user.role}
                    disabled={busy}
                    onChange={(e) => updateRole(user.userId, e.target.value)}
                  >
                    {ROLES.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleBlocked(user)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      blocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {blocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
