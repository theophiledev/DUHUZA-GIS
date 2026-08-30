import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  listUsers,
  setUserStatus,
  pendingListings,
  pendingMarket,
  pendingServices,
  pendingGis,
  pendingJobs,
} from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  StatusBadge,
} from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminUser, Role } from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  MapPin,
  UserCheck,
  UserX,
  Zap,
  Home,
  ShoppingBag,
  Wrench,
  Briefcase,
  Search,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function AdminDashboard() {
  const { tr } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
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

  // Search & Role Filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, selectedRoleFilter, searchQuery]);

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

      {/* 1. Top Executive Metric Grid */}
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
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-amber-800 font-semibold">
            <span>Moderation Queue</span>
            <Link to="/dashboard/manager" className="hover:underline">Review All →</Link>
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
            <span className="text-xs text-gray-500">pending triage</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-emerald-700">
            <span>Cadastral Demarcations</span>
            <Link to="/gis" className="font-semibold underline">Live Map</Link>
          </div>
        </Card>

        {/* Governance & Override Power */}
        <Card statusRail="info" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('moderationHub')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-[#0F766E]">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-heading text-base font-bold text-gray-900">Admin Authority</span>
            <p className="text-xs text-gray-500 mt-0.5">RBAC &amp; override privileges</p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <Link to="/dashboard/admin/users" className="text-xs font-bold text-[#0F766E] hover:underline">
              Manage Permissions Matrix →
            </Link>
          </div>
        </Card>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: User Directory & RBAC Governance (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          <Card className="overflow-hidden border-[#E2E8E6] bg-white shadow-xs space-y-4 p-5">
            {/* Header with Search and Role Filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-heading font-bold text-gray-900 text-base">{tr('users')} Directory</h3>
                <p className="text-xs text-gray-500">Live account management and status controls</p>
              </div>

              {/* User Search Input */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter users..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'ADMIN', 'MANAGER', 'AGENT', 'CLIENT'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRoleFilter(role)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedRoleFilter === role
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {role === 'ALL' ? 'All Roles' : role}
                  <span className="ml-1 text-[10px] opacity-80">
                    ({role === 'ALL' ? users.length : users.filter((u) => u.role === role).length})
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingSpinner label={tr('loading')} />
            ) : filteredUsers.length === 0 ? (
              <EmptyState message={tr('noResults')} />
            ) : (
              <DataTable<AdminUser>
                data={filteredUsers.slice(0, 8)}
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
                        <div>
                          <span className="font-semibold text-gray-900 block">{u.name}</span>
                          <span className="font-mono-data text-[11px] text-gray-400">ID: {u.id.slice(0, 6)}</span>
                        </div>
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

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span>Showing {Math.min(8, filteredUsers.length)} of {filteredUsers.length} filtered users</span>
              <Link to="/dashboard/admin/users" className="font-bold text-[#0F766E] hover:underline flex items-center gap-1">
                <span>View Full RBAC Matrix</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Analytics, Multi-Vertical Backlog & Quick Actions (4 cols) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Role Distribution Card */}
          <Card className="p-5 space-y-4 border border-[#E2E8E6]">
            <h3 className="font-heading font-bold text-gray-900 text-sm">
              Role Distribution
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="text-purple-700 font-bold">Administrators</span>
                  <span className="font-bold text-gray-900">{stats.admins}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.admins / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="text-amber-700 font-bold">Managers</span>
                  <span className="font-bold text-gray-900">{stats.managers}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-amber-600"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.managers / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="text-teal-700 font-bold">Agents &amp; Surveyors</span>
                  <span className="font-bold text-gray-900">{stats.agents}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#0F766E]"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.agents / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="text-blue-700 font-bold">Clients &amp; Public Users</span>
                  <span className="font-bold text-gray-900">{stats.clients}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.clients / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Multi-Vertical Moderation Backlog Status */}
          <Card className="p-5 space-y-3 border border-[#E2E8E6]">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-gray-900 text-sm">
                Moderation Queues
              </h3>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {totalPendingModeration} Pending
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5">
                <span className="flex items-center gap-2 text-gray-700">
                  <Home className="h-4 w-4 text-[#0F766E]" /> Property Listings
                </span>
                <span className="font-bold text-gray-900">{stats.pendingListingsCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5">
                <span className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-emerald-600" /> GIS Demarcations
                </span>
                <span className="font-bold text-gray-900">{stats.pendingGisCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5">
                <span className="flex items-center gap-2 text-gray-700">
                  <ShoppingBag className="h-4 w-4 text-amber-600" /> Isoko Items
                </span>
                <span className="font-bold text-gray-900">{stats.pendingMarketCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5">
                <span className="flex items-center gap-2 text-gray-700">
                  <Wrench className="h-4 w-4 text-purple-600" /> Trade Services
                </span>
                <span className="font-bold text-gray-900">{stats.pendingServicesCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5">
                <span className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="h-4 w-4 text-blue-600" /> Job Postings
                </span>
                <span className="font-bold text-gray-900">{stats.pendingJobsCount}</span>
              </div>
            </div>

            <Link
              to="/dashboard/manager"
              className="mt-2 block w-full rounded-xl bg-amber-500/10 p-2.5 text-center text-xs font-bold text-amber-900 hover:bg-amber-500/20 transition"
            >
              Open Manager Moderation Suite →
            </Link>
          </Card>

          {/* Quick Admin Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard/admin/users/new" className="group">
              <Card className="p-4 border-[#E2E8E6] bg-gradient-to-br from-white to-purple-50/50 hover:border-purple-300 transition text-center space-y-1">
                <UserPlus className="h-5 w-5 mx-auto text-purple-700" />
                <span className="block text-xs font-bold text-gray-900 group-hover:text-purple-700">Provision User</span>
              </Card>
            </Link>
            <Link to="/dashboard/admin/users" className="group">
              <Card className="p-4 border-[#E2E8E6] bg-gradient-to-br from-white to-teal-50/50 hover:border-teal-300 transition text-center space-y-1">
                <ShieldAlert className="h-5 w-5 mx-auto text-[#0F766E]" />
                <span className="block text-xs font-bold text-gray-900 group-hover:text-[#0F766E]">RBAC Matrix</span>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
