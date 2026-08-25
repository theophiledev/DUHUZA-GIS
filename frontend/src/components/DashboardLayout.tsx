import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Role } from '../types';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: number | string;
  exact?: boolean;
}

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  navItems?: NavItem[];
}

export function DashboardLayout({
  title,
  subtitle,
  actions,
  children,
  navItems,
}: DashboardLayoutProps) {
  const { user } = useAuth();
  const { tr } = useLanguage();
  const location = useLocation();

  if (!user) return null;

  const roleConfig: Record<
    Role,
    {
      label: string;
      icon: string;
      gradient: string;
      badgeBg: string;
      accentBorder: string;
      defaultNav: NavItem[];
    }
  > = {
    ADMIN: {
      label: tr('roleAdmin'),
      icon: '🛡️',
      gradient: 'from-purple-900 via-indigo-900 to-brand-900',
      badgeBg: 'bg-purple-100 border-purple-300 text-purple-800',
      accentBorder: 'border-purple-200',
      defaultNav: [
        { to: '/dashboard/admin', label: tr('overview'), icon: '📊', exact: true },
        { to: '/dashboard/admin/users', label: tr('users'), icon: '👥' },
        { to: '/dashboard/admin/users/new', label: tr('createUser'), icon: '➕' },
        { to: '/dashboard/manager', label: tr('moderationHub'), icon: '⚡' },
      ],
    },
    MANAGER: {
      label: tr('roleManager'),
      icon: '⚡',
      gradient: 'from-amber-900 via-stone-800 to-brand-900',
      badgeBg: 'bg-amber-100 border-amber-300 text-amber-900',
      accentBorder: 'border-amber-200',
      defaultNav: [
        { to: '/dashboard/manager', label: tr('overview'), icon: '📊', exact: true },
        { to: '/dashboard/manager/listings', label: tr('listings'), icon: '🏠' },
        { to: '/dashboard/manager/gis', label: tr('gisRequest'), icon: '🗺️' },
        { to: '/dashboard/manager/market', label: tr('market'), icon: '🛒' },
        { to: '/dashboard/manager/services', label: tr('services'), icon: '🛠️' },
        { to: '/dashboard/manager/jobs', label: tr('jobs'), icon: '💼' },
      ],
    },
    AGENT: {
      label: tr('roleAgent'),
      icon: '📐',
      gradient: 'from-emerald-950 via-teal-900 to-brand-900',
      badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
      accentBorder: 'border-emerald-200',
      defaultNav: [
        { to: '/dashboard/agent', label: tr('overview'), icon: '📊', exact: true },
        { to: '/dashboard/agent/listings', label: tr('myListings'), icon: '🏠' },
        { to: '/dashboard/agent/listings/new', label: tr('createListing'), icon: '➕' },
        { to: '/dashboard/agent/gis', label: tr('assignedGis'), icon: '🗺️' },
      ],
    },
    CLIENT: {
      label: tr('roleClient'),
      icon: '👤',
      gradient: 'from-sky-950 via-brand-900 to-slate-900',
      badgeBg: 'bg-blue-100 border-blue-300 text-blue-900',
      accentBorder: 'border-blue-200',
      defaultNav: [
        { to: '/dashboard/client', label: tr('overview'), icon: '📊', exact: true },
        { to: '/dashboard/client/market', label: tr('myMarketItems'), icon: '🛒' },
        { to: '/dashboard/client/jobs', label: tr('myJobs'), icon: '💼' },
        { to: '/dashboard/client/applications', label: tr('myApplications'), icon: '📄' },
        { to: '/dashboard/client/gis', label: tr('gisRequest'), icon: '🗺️' },
        { to: '/dashboard/client/services', label: tr('serviceProvider'), icon: '🛠️' },
      ],
    },
  };

  const currentRole = roleConfig[user.role] ?? roleConfig.CLIENT;
  const navList = navItems || currentRole.defaultNav;

  return (
    <div className="space-y-6">
      {/* Top Role & Identity Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentRole.gradient} p-6 sm:p-8 text-white shadow-xl`}
      >
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 h-32 w-32 rounded-full bg-brand-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${currentRole.badgeBg}`}
              >
                <span>{currentRole.icon}</span>
                <span>{currentRole.label}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {user.isActive ? tr('active') : tr('suspended')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {title}
            </h1>
            {subtitle && <p className="text-sm sm:text-base text-gray-200/90 max-w-2xl">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md">
              <div className="text-xs text-gray-300">{tr('name')}</div>
              <div className="text-sm font-semibold text-white truncate max-w-[200px]">
                {user.name}
              </div>
              <div className="text-xs text-gray-300 truncate max-w-[200px]">
                {user.email || user.phone || '—'}
              </div>
            </div>
            {actions}
          </div>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {navList.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-md transform scale-[1.02]'
                    : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-brand-600 text-white' : 'bg-white/20 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
