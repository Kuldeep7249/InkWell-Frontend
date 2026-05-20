import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { useApi } from '../../hooks/useApi.js';
import { authApi } from '../../api/authApi.js';
import { postApi } from '../../api/postApi.js';
import { notificationApi } from '../../api/notificationApi.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

export const adminItems = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/role-requests', label: 'Role requests' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/notifications', label: 'Notifications' },
];

export default function AdminDashboard() {
  const users = useApi(() => authApi.users(), []);
  const posts = useApi(() => postApi.admin(), []);
  const notifications = useApi(() => notificationApi.all(), []);

  const chart = [
    {
      name: 'Users',
      value: users.data?.length || 0,
      color: '#2563eb',
      bg: 'from-blue-50 to-blue-100',
      text: 'text-blue-900',
      subText: 'text-blue-600',
      border: 'border-blue-200',
    },
    {
      name: 'Posts',
      value: posts.data?.length || 0,
      color: '#16a34a',
      bg: 'from-emerald-50 to-emerald-100',
      text: 'text-emerald-900',
      subText: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    {
      name: 'Notifications',
      value: notifications.data?.length || 0,
      color: '#9333ea',
      bg: 'from-purple-50 to-purple-100',
      text: 'text-purple-900',
      subText: 'text-purple-600',
      border: 'border-purple-200',
    },
  ];

  return (
    <DashboardLayout title="Admin dashboard" items={adminItems}>
      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {chart.map((c) => (
          <div
            key={c.name}
            className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
          >
            <div
              className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
              style={{ backgroundColor: c.color }}
            />

            <p className={`text-sm font-semibold uppercase tracking-wide ${c.subText}`}>
              Total {c.name}
            </p>

            <h2 className={`mt-3 text-5xl font-black ${c.text}`}>
              {c.value}
            </h2>

            <p className={`mt-2 text-sm ${c.subText}`}>
              {c.name} available in system
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            System Analytics
          </h3>
          <p className="text-sm text-slate-500">
            Overview of users, posts and notifications
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {chart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
