import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useApi } from '../../hooks/useApi.js';
import { postApi } from '../../api/postApi.js';

const items = [
  { to: '/author', label: 'Overview' },
  { to: '/author/posts', label: 'My posts' },
  { to: '/author/posts/new', label: 'Create post' },
  { to: '/author/media', label: 'Media library' },
];

export default function AuthorDashboard() {
  const { user } = useAuth();
  const { data: posts } = useApi(() => postApi.byUser(user.userId), [user.userId]);

  const totalPosts = posts?.length || 0;
  const approvedPosts = posts?.filter((p) => p.status === 'APPROVED').length || 0;
  const pendingRejectedPosts =
    posts?.filter((p) => p.status !== 'APPROVED').length || 0;

  return (
    <DashboardLayout title="Author dashboard" items={items}>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-300/30" />

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Total posts
          </p>

          <h2 className="mt-3 text-5xl font-black text-blue-950">
            {totalPosts}
          </h2>

          <p className="mt-2 text-sm text-blue-700">
            All posts created by you
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-300/30" />

          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Approved
          </p>

          <h2 className="mt-3 text-5xl font-black text-emerald-950">
            {approvedPosts}
          </h2>

          <p className="mt-2 text-sm text-emerald-700">
            Posts published successfully
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-rose-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-300/30" />

          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Pending / Rejected
          </p>

          <h2 className="mt-3 text-5xl font-black text-rose-950">
            {pendingRejectedPosts}
          </h2>

          <p className="mt-2 text-sm text-rose-700">
            Posts waiting for review or rejected
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}