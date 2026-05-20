import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/layout/Layout.jsx';
import { authApi } from '../../api/authApi.js';
import { useApi } from '../../hooks/useApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { fmt } from '../../utils/helpers.js';

const REQUESTABLE_ROLES = ['AUTHOR', 'ADMIN'];

function statusTone(status) {
  if (status === 'APPROVED') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (status === 'REJECTED') return 'text-rose-700 bg-rose-50 border-rose-200';
  return 'text-amber-700 bg-amber-50 border-amber-200';
}

export default function RoleRequests() {
  const { user } = useAuth();
  const { data, setData, loading } = useApi(() => authApi.getMyRoleRequests(), []);
  const [form, setForm] = useState({ requestedRole: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const availableRoles = useMemo(
    () => REQUESTABLE_ROLES.filter((role) => role !== user?.role),
    [user?.role]
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!form.requestedRole) {
      toast.error('Select the role you want to request');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.createRoleRequest({
        requestedRole: form.requestedRole,
        reason: form.reason.trim()
      });

      setData((current = []) => [response.data, ...current]);
      setForm({ requestedRole: '', reason: '' });
      toast.success('Role change request sent to admin');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role === 'ADMIN') {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl">
          <div className="card">
            <h1 className="text-3xl font-black">Role requests</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Admin accounts do not need to submit role change requests.
            </p>
            <Link to="/admin/role-requests" className="btn-primary mt-6 inline-flex self-start">
              Review requests
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form onSubmit={submit} className="card grid gap-4">
          <div>
            <h1 className="text-3xl font-black">Request role change</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Send a request to the admin when you want a different account role.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            Current role: <span className="font-bold">{user?.role}</span>
          </div>

          <select
            className="input"
            value={form.requestedRole}
            onChange={(event) => setForm({ ...form, requestedRole: event.target.value })}
            disabled={submitting || availableRoles.length === 0}
          >
            <option value="">Select requested role</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <textarea
            className="input min-h-36"
            placeholder="Tell the admin why you need this role"
            value={form.reason}
            onChange={(event) => setForm({ ...form, reason: event.target.value })}
            disabled={submitting}
          />

          <button className="btn-primary self-start" disabled={submitting || availableRoles.length === 0}>
            Submit request
          </button>
        </form>

        <div className="card">
          <div className="mb-5">
            <h2 className="text-2xl font-black">My requests</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Track whether your role requests are pending, approved, or rejected.
            </p>
          </div>

          <div className="grid gap-4">
            {!loading && (!data || data.length === 0) && (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No role requests yet.
              </div>
            )}

            {data?.map((request) => (
              <div key={request.requestId} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">
                      {request.currentRole} to {request.requestedRole}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Requested {fmt(request.requestedAt)}
                    </p>
                  </div>

                  <span className={`rounded-full border px-3 py-1 text-xs font-black tracking-wide ${statusTone(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                {request.reason && (
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
                )}

                {request.reviewedAt && (
                  <p className="mt-3 text-xs text-slate-500">
                    Reviewed {fmt(request.reviewedAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
