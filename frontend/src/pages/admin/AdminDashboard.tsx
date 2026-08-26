import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listUsers, setUserStatus, pendingListings, pendingMarket, pendingServices, pendingGis, pendingJobs } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, DataTable, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminUser, Role } from '../../types';
import { Users, UserPlus, ShieldCheck, MapPin, UserCheck, UserX, Zap, Home, Map, ShoppingCart } from 'lucide-react';

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
      showToast(`User status updated for ${user.name}!`, 'success');
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

  const roleColors: Record<Role, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border border-purple-200',
    MANAGER: 'bg-amber-100 text-amber-900 border border-amber-200',
    AGENT: 'bg-teal-100 text-teal-900 border border-teal-200',
    CLIENT: 'bg-blue-100 text-blue-900 border border-blue-200',
  };

  return (
    <DashboardLayout
      title={tr('adminDashboard')}
      subtitle="Role-Based Access Control (RBAC), system monitoring, fine-grained privileges, and multi-vertical governance."
      actions={
        <Link to="/dashboard/admin/users/new">
          <Button variant="primary" className="flex items-center gap-1.5 font-bold shadow-xs">
            <UserPlus className="h-4 w-4" />
            <span>{tr('createUser')}</span>
          </Button>
        </Link>
      }
    >
      {error && <ErrorAlert message={error} onRetry={loadData} />}

      {/* KPI Metric Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card statusRail="approved" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('totalUsers')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-gray-900">{stats.totalUsers}</span>
            <span className="text-xs font-semibold text-emerald-600">({stats.activeUsers} {tr('active')})</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="rounded bg-purple-50 px-1.5 py-0.5 font-medium text-purple-700">{stats.admins} Admin</span>
            <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">{stats.managers} Manager</span>
            <span className="rounded bg-teal-50 px-1.5 py-0.5 font-medium text-teal-700">{stats.agents} Agent</span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">{stats.clients} Client</span>
          </div>
        </Card>

        {/* Total Pending Queue */}
        <Card statusRail="pending" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('pendingApprovals')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
              <Zap size={18} strokeWidth={1.75} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-amber-800">{totalPendingModeration}</span>
            <span className="text-xs text-gray-500">across 5 verticals</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1 pt-2 border-t border-gray-100 text-xs">
            <span className="inline-flex items-center gap-1 text-gray-600"><Home size={14} strokeWidth={1.75} />{stats.pendingListingsCount} listings</span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-gray-600"><Map size={14} strokeWidth={1.75} />{stats.pendingGisCount} GIS</span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-gray-600"><ShoppingCart size={14} strokeWidth={1.75} />{stats.pendingMarketCount} market</span>
          </div>
        </Card>

        {/* GIS & Survey Missions */}
        <Card statusRail="assigned" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('gisRequest')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <MapPin className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-emerald-800">{stats.pendingGisCount}</span>
            <span className="text-xs text-gray-500">pending triage/assign</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-emerald-700">
            <span>Cadastral & UPI Surveys</span>
            <Link to="/gis" className="font-semibold underline">View Map</Link>
          </div>
        </Card>

        {/* Moderation Hub Shortcut */}
        <Card statusRail="info" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('moderationHub')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-[#0F766E]">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-heading text-base font-bold text-gray-900">Admin Authority</span>
            <p className="text-xs text-gray-500 mt-0.5">Direct oversight & override power</p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <Link to="/dashboard/manager" className="text-xs font-bold text-[#0F766E] hover:underline">
              Open Full Moderation Suite →
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Action & RBAC Navigation Tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/dashboard/admin/users" className="group">
          <Card className="h-full border-[#E2E8E6] bg-gradient-to-br from-white to-purple-50/40 p-5 transition hover:border-purple-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-gray-900 group-hover:text-purple-700">{tr('users')} & RBAC Matrix</h3>
                <p className="text-xs text-gray-500">Manage accounts, status, & granular permissions</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/admin/users/new" className="group">
          <Card className="h-full border-[#E2E8E6] bg-gradient-to-br from-white to-teal-50/40 p-5 transition hover:border-teal-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F766E] text-white shadow-xs">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-gray-900 group-hover:text-[#0F766E]">{tr('createUser')}</h3>
                <p className="text-xs text-gray-500">Provision Agent, Manager, or Admin credentials</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/manager" className="group">
          <Card className="h-full border-[#E2E8E6] bg-gradient-to-br from-white to-amber-50/40 p-5 transition hover:border-amber-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs font-bold text-xl">
                <Zap size={24} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-gray-900 group-hover:text-amber-700">{tr('moderationHub')}</h3>
                <p className="text-xs text-gray-500">Review {totalPendingModeration} pending submissions</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Users Table with DataTable */}
      <Card className="overflow-hidden border-[#E2E8E6] bg-white shadow-xs space-y-4">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading font-bold text-gray-900">{tr('users')} Directory Overview</h3>
            <p className="text-xs text-gray-500">Recent registered users and privilege states</p>
          </div>
          <Link to="/dashboard/admin/users">
            <Button variant="secondary" className="text-xs font-bold">
              View All {users.length} Users & Permissions →
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label={tr('loading')} />
        ) : users.length === 0 ? (
          <EmptyState message={tr('noResults')} />
        ) : (
          <DataTable<AdminUser>
            data={users.slice(0, 8)}
            keyExtractor={(u) => u.id}
            statusRailExtractor={(u) => (u.isActive ? 'approved' : 'rejected')}
            columns={[
              {
                header: tr('name'),
                render: (u) => (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 font-bold text-[#0F766E] border border-teal-200">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900">{u.name}</span>
                  </div>
                ),
              },
              {
                header: tr('identifier'),
                render: (u) => (
                  <span className="font-mono-data text-xs text-gray-600">{u.email || u.phone || '—'}</span>
                ),
              },
              {
                header: tr('role'),
                render: (u) => (
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${roleColors[u.role]}`}>
                    {u.role}
                  </span>
                ),
              },
              {
                header: tr('status'),
                render: (u) => <StatusBadge status={u.isActive ? 'ACTIVE' : 'SUSPENDED'} />,
              },
              {
                header: tr('actions'),
                headerClassName: 'text-right',
                className: 'text-right',
                render: (u) => (
                  <Button
                    variant={u.isActive ? 'secondary' : 'primary'}
                    onClick={() => toggleUserStatus(u)}
                    className="text-xs px-2.5 py-1 min-h-[30px] font-bold"
                  >
                    {u.isActive ? (
                      <span className="text-red-700 flex items-center gap-1">
                        <UserX className="h-3 w-3" />
                        <span>Suspend</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>Activate</span>
                      </span>
                    )}
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
