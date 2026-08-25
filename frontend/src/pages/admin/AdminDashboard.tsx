import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listUsers, setUserStatus, pendingListings, pendingMarket, pendingServices, pendingGis, pendingJobs } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminUser, Role } from '../../types';

export function AdminDashboard() {
  const { tr } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    managers: 0,
    agents: 0,
    clients: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    pendingListingsCount: 0,
    pendingMarketCount: 0,
    pendingServicesCount: 0,
    pendingGisCount: 0,
    pendingJobsCount: 0,
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allUsers, pListings, pMarket, pServices, pGis, pJobs] = await Promise.allSettled([
        listUsers(),
        pendingListings(),
        pendingMarket(),
        pendingServices(),
        pendingGis(),
        pendingJobs(),
      ]);

      const userList = allUsers.status === 'fulfilled' ? allUsers.value : [];
      setUsers(userList);

      const admins = userList.filter((u) => u.role === 'ADMIN').length;
      const managers = userList.filter((u) => u.role === 'MANAGER').length;
      const agents = userList.filter((u) => u.role === 'AGENT').length;
      const clients = userList.filter((u) => u.role === 'CLIENT').length;
      const activeUsers = userList.filter((u) => u.isActive).length;
      const suspendedUsers = userList.length - activeUsers;

      setStats({
        totalUsers: userList.length,
        admins,
        managers,
        agents,
        clients,
        activeUsers,
        suspendedUsers,
        pendingListingsCount: pListings.status === 'fulfilled' ? pListings.value.length : 0,
        pendingMarketCount: pMarket.status === 'fulfilled' ? pMarket.value.length : 0,
        pendingServicesCount: pServices.status === 'fulfilled' ? pServices.value.length : 0,
        pendingGisCount: pGis.status === 'fulfilled' ? pGis.value.length : 0,
        pendingJobsCount: pJobs.status === 'fulfilled' ? pJobs.value.length : 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleUserStatus = async (user: AdminUser) => {
    try {
      await setUserStatus(user.id, !user.isActive);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : tr('error'));
    }
  };

  const totalPendingModeration =
    stats.pendingListingsCount +
    stats.pendingMarketCount +
    stats.pendingServicesCount +
    stats.pendingGisCount +
    stats.pendingJobsCount;

  return (
    <DashboardLayout
      title={tr('adminDashboard')}
      subtitle="Role-Based Access Control (RBAC), system monitoring, fine-grained privileges, and multi-vertical governance."
      actions={
        <Link to="/dashboard/admin/users/new">
          <Button variant="primary" className="shadow-lg hover:shadow-xl">
            ➕ {tr('createUser')}
          </Button>
        </Link>
      }
    >
      {error && <ErrorAlert message={error} onRetry={loadData} />}

      {/* KPI Metric Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="border-l-4 border-l-purple-600 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('totalUsers')}</span>
            <span className="rounded-lg bg-purple-100 p-2 text-xl text-purple-700">👥</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats.totalUsers}</span>
            <span className="text-xs font-semibold text-emerald-600">({stats.activeUsers} {tr('active')})</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="rounded bg-purple-50 px-1.5 py-0.5 font-medium text-purple-700">{stats.admins} Admin</span>
            <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">{stats.managers} Manager</span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">{stats.agents} Agent</span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">{stats.clients} Client</span>
          </div>
        </Card>

        {/* Total Pending Queue */}
        <Card className="border-l-4 border-l-amber-500 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('pendingApprovals')}</span>
            <span className="rounded-lg bg-amber-100 p-2 text-xl text-amber-700">⚡</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{totalPendingModeration}</span>
            <span className="text-xs text-gray-500">across 5 verticals</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-600">🏠 {stats.pendingListingsCount} listings</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-600">🗺️ {stats.pendingGisCount} GIS</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-600">🛒 {stats.pendingMarketCount} market</span>
          </div>
        </Card>

        {/* GIS & Survey Missions */}
        <Card className="border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('gisRequest')}</span>
            <span className="rounded-lg bg-emerald-100 p-2 text-xl text-emerald-700">🗺️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{stats.pendingGisCount}</span>
            <span className="text-xs text-gray-500">pending triage/assign</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-emerald-700">
            <span>Cadastral & UPI Surveys</span>
            <Link to="/gis" className="font-semibold underline">View Map</Link>
          </div>
        </Card>

        {/* Moderation Hub Shortcut */}
        <Card className="border-l-4 border-l-indigo-600 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('moderationHub')}</span>
            <span className="rounded-lg bg-indigo-100 p-2 text-xl text-indigo-700">🛡️</span>
          </div>
          <div className="mt-2">
            <span className="text-base font-bold text-gray-900">Admin Authority</span>
            <p className="text-xs text-gray-500 mt-0.5">Direct oversight & override power</p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <Link to="/dashboard/manager" className="text-xs font-bold text-brand-700 hover:underline">
              Open Full Moderation Suite →
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Action & RBAC Navigation Tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/dashboard/admin/users" className="group">
          <Card className="h-full border border-gray-200 bg-gradient-to-br from-white to-purple-50/40 p-5 transition hover:border-purple-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-2xl text-white shadow-md">
                👥
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-purple-700">{tr('users')} & RBAC Matrix</h3>
                <p className="text-xs text-gray-500">Manage accounts, status, & granular permissions</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/admin/users/new" className="group">
          <Card className="h-full border border-gray-200 bg-gradient-to-br from-white to-emerald-50/40 p-5 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-2xl text-white shadow-md">
                ➕
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700">{tr('createUser')}</h3>
                <p className="text-xs text-gray-500">Provision Agent, Manager, or Admin credentials</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/manager" className="group">
          <Card className="h-full border border-gray-200 bg-gradient-to-br from-white to-amber-50/40 p-5 transition hover:border-amber-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-2xl text-white shadow-md">
                ⚡
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-amber-700">{tr('moderationHub')}</h3>
                <p className="text-xs text-gray-500">Review {totalPendingModeration} pending submissions</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Users Table */}
      <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{tr('users')} Directory Overview</h3>
            <p className="text-xs text-gray-500">Recent registered users and privilege states</p>
          </div>
          <Link to="/dashboard/admin/users">
            <Button variant="secondary" className="text-xs">
              View All {users.length} Users & Permissions →
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label={tr('loading')} />
        ) : users.length === 0 ? (
          <EmptyState message={tr('noResults')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3.5">{tr('name')}</th>
                  <th className="px-5 py-3.5">{tr('identifier')}</th>
                  <th className="px-5 py-3.5">{tr('role')}</th>
                  <th className="px-5 py-3.5">{tr('status')}</th>
                  <th className="px-5 py-3.5 text-right">{tr('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.slice(0, 8).map((u) => {
                  const roleColors: Record<Role, string> = {
                    ADMIN: 'bg-purple-100 text-purple-800 border border-purple-200',
                    MANAGER: 'bg-amber-100 text-amber-900 border border-amber-200',
                    AGENT: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
                    CLIENT: 'bg-blue-100 text-blue-900 border border-blue-200',
                  };

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {u.email || u.phone || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${roleColors[u.role]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={u.isActive ? 'APPROVED' : 'REJECTED'} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant={u.isActive ? 'secondary' : 'primary'}
                          onClick={() => toggleUserStatus(u)}
                          className="text-xs px-2.5 py-1"
                        >
                          {u.isActive ? tr('suspended') : tr('active')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
