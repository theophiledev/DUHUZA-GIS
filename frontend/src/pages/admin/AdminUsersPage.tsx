import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listUsers, setUserPermission, setUserStatus } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, Input, StatusBadge } from '../../components/ui';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../../components/SkeletonLoaders';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminUser, Role } from '../../types';

interface PermissionConfig {
  key: string;
  label: string;
  description: string;
  defaultOnRoles: Role[];
}

const PERMISSIONS_LIST: PermissionConfig[] = [
  {
    key: 'can_approve_property',
    label: 'Property Listings Approval',
    description: 'Permits approving, rejecting, and reassigning real estate & property listings.',
    defaultOnRoles: ['ADMIN', 'MANAGER'],
  },
  {
    key: 'can_approve_gis',
    label: 'GIS Survey Approval & Dispatch',
    description: 'Permits managing cadastral survey requests and assigning certified agents/surveyors.',
    defaultOnRoles: ['ADMIN'],
  },
  {
    key: 'can_approve_jobs',
    label: 'Job Postings Moderation',
    description: 'Permits approving or rejecting client job postings.',
    defaultOnRoles: ['ADMIN'],
  },
  {
    key: 'can_approve_market',
    label: 'Market / Isoko Moderation',
    description: 'Permits moderating marketplace goods (electronics, furniture, produce, etc.).',
    defaultOnRoles: ['ADMIN', 'MANAGER'],
  },
  {
    key: 'can_approve_services',
    label: 'Service Providers Verification',
    description: 'Permits verifying and approving registered tradespeople and service providers.',
    defaultOnRoles: ['ADMIN', 'MANAGER'],
  },
];

export function AdminUsersPage() {
  const { tr } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Permission Editor Modal State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [savingPermission, setSavingPermission] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    listUsers()
      .then((data) => {
        setUsers(data);
        if (editingUser) {
          const refreshed = data.find((u) => u.id === editingUser.id);
          if (refreshed) setEditingUser(refreshed);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (u: AdminUser) => {
    try {
      await setUserStatus(u.id, !u.isActive);
      showToast(`User ${u.name} status updated!`, 'success');
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : tr('error'));
    }
  };

  const handleTogglePermission = async (user: AdminUser, permKey: string, currentValue: boolean) => {
    setSavingPermission(permKey);
    try {
      await setUserPermission(user.id, permKey, String(!currentValue));
      showToast('Permission override updated successfully!', 'success');
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : tr('error'));
    } finally {
      setSavingPermission(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
        (u.phone && u.phone.includes(search));

      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && u.isActive) ||
        (selectedStatus === 'SUSPENDED' && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, selectedRole, selectedStatus]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const roleColors: Record<Role, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    MANAGER: 'bg-amber-100 text-amber-900 border-amber-200',
    AGENT: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    CLIENT: 'bg-blue-100 text-blue-900 border-blue-200',
  };

  return (
    <DashboardLayout
      title={tr('users')}
      subtitle="Comprehensive user directory, account statuses, and granular RBAC permission overrides."
      actions={
        <Link to="/dashboard/admin/users/new">
          <Button variant="primary">➕ {tr('createUser')}</Button>
        </Link>
      }
    >
      {/* Search & Filter Bar */}
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-50/80 p-1 text-xs font-semibold">
              {(['ALL', 'ADMIN', 'MANAGER', 'AGENT', 'CLIENT'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r);
                    setCurrentPage(1);
                  }}
                  className={`rounded-md px-3 py-1 transition ${
                    selectedRole === r ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {r === 'ALL' ? tr('filterAll') : r}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-50/80 p-1 text-xs font-semibold">
              {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(s);
                    setCurrentPage(1);
                  }}
                  className={`rounded-md px-3 py-1 transition ${
                    selectedStatus === s ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {s === 'ALL' ? tr('filterAll') : s === 'ACTIVE' ? tr('active') : tr('suspended')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {error && <ErrorAlert message={error} onRetry={load} />}
      {loading && <TableSkeleton rows={6} cols={6} />}

      {!loading && !error && filteredUsers.length === 0 && (
        <EmptyState message="No matching users found in the directory." />
      )}

      {/* Users Table */}
      {!loading && filteredUsers.length > 0 && (
        <div className="space-y-4">
          <Card className="overflow-hidden p-0 border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5">{tr('name')}</th>
                    <th className="px-5 py-3.5">{tr('identifier')}</th>
                    <th className="px-5 py-3.5">{tr('role')}</th>
                    <th className="px-5 py-3.5">{tr('status')}</th>
                    <th className="px-5 py-3.5">{tr('permissions')}</th>
                    <th className="px-5 py-3.5 text-right">{tr('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((u) => {
                    const customPermCount = u.permissions?.length ?? 0;

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3.5 font-medium text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-800 border border-brand-200 shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{u.name}</div>
                              <div className="text-xs text-gray-400 font-mono">ID: {u.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 font-medium">
                          {u.email || u.phone || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${roleColors[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={u.isActive ? 'APPROVED' : 'REJECTED'} />
                        </td>
                        <td className="px-5 py-3.5">
                          {u.role === 'ADMIN' ? (
                            <span className="text-xs font-semibold text-purple-700">Full Master Rights</span>
                          ) : (
                            <Button
                              variant="secondary"
                              className="text-xs px-2.5 py-1 gap-1"
                              onClick={() => setEditingUser(u)}
                            >
                              ⚙️ {tr('managePermissions')}
                              {customPermCount > 0 && (
                                <span className="rounded-full bg-brand-600 px-1.5 py-0.2 text-[10px] text-white">
                                  {customPermCount}
                                </span>
                              )}
                            </Button>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <Button
                            variant={u.isActive ? 'secondary' : 'primary'}
                            onClick={() => toggleStatus(u)}
                            className="text-xs px-3 py-1"
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
          </Card>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 25, 50]}
            itemLabel="users"
            scrollToTop={false}
          />
        </div>
      )}

      {/* Granular Permissions Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Granular Privileges: <span className="text-brand-700">{editingUser.name}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Account Role: <span className="font-bold">{editingUser.role}</span> · Override default privileges for this specific account (FR3a).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Permission Toggles List */}
            <div className="divide-y divide-gray-100 space-y-3">
              {PERMISSIONS_LIST.map((p) => {
                const override = editingUser.permissions?.find((perm) => perm.permissionKey === p.key);
                const isExplicitlyDefined = override !== undefined;
                const isEnabled = isExplicitlyDefined
                  ? override.value === 'true'
                  : p.defaultOnRoles.includes(editingUser.role);
                const isPending = savingPermission === p.key;

                return (
                  <div key={p.key} className="pt-3 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{p.label}</span>
                        {isExplicitlyDefined ? (
                          <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5">
                            Custom Override
                          </span>
                        ) : (
                          <span className="rounded bg-gray-100 text-gray-500 text-[10px] font-medium px-1.5 py-0.5">
                            Role Default ({p.defaultOnRoles.includes(editingUser.role) ? 'Enabled' : 'Disabled'})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleTogglePermission(editingUser, p.key, isEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-brand-600' : 'bg-gray-200'
                        } ${isPending ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                {tr('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
