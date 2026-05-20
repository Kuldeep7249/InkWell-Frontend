import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { authApi } from '../../api/authApi.js';
import { useApi } from '../../hooks/useApi.js';
import { fmt } from '../../utils/helpers.js';
import { adminItems } from './AdminDashboard.jsx';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

function statusTone(status) {
  if (status === 'APPROVED') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (status === 'REJECTED') return 'text-rose-700 bg-rose-50 border-rose-200';
  return 'text-amber-700 bg-amber-50 border-amber-200';
}

export default function ManageRoleRequests() {
  const [status, setStatus] = useState('ALL');
  const [busyId, setBusyId] = useState(null);
  const { data, setData, loading } = useApi(
    () => authApi.getRoleRequests(status === 'ALL' ? undefined : status),
    [status]
  );

  const review = async (requestId, action) => {
    setBusyId(requestId);
    try {
      const response = action === 'approve'
        ? await authApi.approveRequest(requestId)
        : await authApi.rejectRequest(requestId);

      setData((current = []) =>
        current.map((request) =>
          request.requestId === requestId ? response.data : request
        )
      );
      toast.success(action === 'approve' ? 'Role request approved' : 'Role request rejected');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout title="Role requests" items={adminItems}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-slate-600 dark:text-slate-300">
            Review author and reader requests for role changes.
          </p>
        </div>

        <select
          className="input max-w-52"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter} value={filter}>{filter}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {!loading && (!data || data.length === 0) && (
          <div className="card text-center text-slate-500 dark:text-slate-400">
            No role requests found for this filter.
          </div>
        )}

        {data?.map((request) => {
          const busy = busyId === request.requestId;

          return (
            <div className="card" key={request.requestId}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold">{request.fullName || request.username}</h3>
                    <span className={`rounded-full border px-3 py-1 text-xs font-black tracking-wide ${statusTone(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {request.email} | {request.currentRole} to {request.requestedRole}
                  </p>

                  {request.reason && (
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
                  )}

                  <p className="mt-3 text-xs text-slate-500">
                    Requested {fmt(request.requestedAt)}
                    {request.reviewedAt ? ` | Reviewed ${fmt(request.reviewedAt)}` : ''}
                  </p>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => review(request.requestId, 'approve')}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => review(request.requestId, 'reject')}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
