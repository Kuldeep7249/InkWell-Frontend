import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { postApi } from '../../api/postApi.js';
import { useApi } from '../../hooks/useApi.js';
import { unwrap } from '../../utils/helpers.js';
import { adminItems } from './AdminDashboard.jsx';

function normalizeStatus(status) {
  return String(status || '').toUpperCase();
}

export default function ManagePosts() {
  const { data, setData } = useApi(() => postApi.admin(), []);

  const mergeUpdatedPost = (id, updatedPost) => {
    setData((data || []).map((post) => (post.id === id ? { ...post, ...updatedPost } : post)));
  };

  const remove = async (id) => {
    if (!confirm('Delete this post?')) return;

    await postApi.remove(id);
    setData((data || []).filter((post) => post.id !== id));
    toast.success('Post deleted');
  };

  const approve = async (id) => {
    const response = await postApi.approve(id);
    mergeUpdatedPost(id, unwrap(response) || response?.data || { status: 'APPROVED' });
    toast.success('Post approved');
  };

  const reject = async (id) => {
    const response = await postApi.reject(id);
    mergeUpdatedPost(id, unwrap(response) || response?.data || { status: 'REJECTED' });
    toast.success('Post rejected');
  };

  return (
    <DashboardLayout title="Manage posts" items={adminItems}>
      <div className="grid gap-4">
        {data?.map((post) => {
          const status = normalizeStatus(post.status);
          const isApproved = status === 'APPROVED';
          const isRejected = status === 'REJECTED';

          return (
            <div className="card" key={post.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p className="text-sm text-slate-500">
                    Author #{post.userId} • {post.status}
                  </p>
                </div>

                {isApproved ? (
                  <div className="flex gap-2">
                    <span className="badge">Approved</span>
                    <button onClick={() => remove(post.id)} className="btn-muted">
                      Delete
                    </button>
                  </div>
                ) : isRejected ? (
                  <div className="flex gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">
                      Rejected
                    </span>
                    <button onClick={() => remove(post.id)} className="btn-muted">
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => approve(post.id)} className="btn-primary">
                      Approve
                    </button>
                    <button onClick={() => reject(post.id)} className="btn-muted">
                      Reject
                    </button>
                    <button onClick={() => remove(post.id)} className="btn-muted">
                      Delete
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
