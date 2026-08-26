import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Role } from '../types';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ShieldCheck,
  Home,
  MapPin,
  ShoppingBag,
  Wrench,
  Briefcase,
  PlusCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Globe,
} from 'lucide-react';
import { languageLabels } from '../i18n/translations';
import type { LanguageCode } from '../types';

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  exact?: boolean;
}

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  navItems?: DashboardNavItem[];
}

export function DashboardLayout({
  title,
  subtitle,
  actions,
  children,
  navItems,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { lang, setLang, tr } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Responsive Breakpoint Detection
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Persistence for Desktop and Tablet sidebar states
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('dashboard_sidebar_collapsed_desktop');
    return saved === 'true';
  });

  const [isTabletCollapsed, setIsTabletCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('dashboard_sidebar_collapsed_tablet');
    return saved !== 'false'; // Tablet defaults to collapsed (true)
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  const isSidebarCollapsed = isDesktop ? isDesktopCollapsed : isTabletCollapsed;

  const toggleSidebar = () => {
    if (isDesktop) {
      const next = !isDesktopCollapsed;
      setIsDesktopCollapsed(next);
      localStorage.setItem('dashboard_sidebar_collapsed_desktop', String(next));
    } else if (isTablet) {
      const next = !isTabletCollapsed;
      setIsTabletCollapsed(next);
      localStorage.setItem('dashboard_sidebar_collapsed_tablet', String(next));
    }
  };

  if (!user) return null;

  // 3. Information Architecture & Nav Definitions Per Role
  const roleConfig: Record<
    Role,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      colorClass: string;
      badgeBg: string;
      gradient: string;
      defaultNav: DashboardNavItem[];
    }
  > = {
    ADMIN: {
      label: tr('roleAdmin'),
      icon: ShieldCheck,
      colorClass: 'text-purple-600',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      gradient: 'from-slate-900 via-purple-950 to-[#0F766E]',
      defaultNav: [
        { to: '/dashboard/admin', label: tr('overview'), icon: LayoutDashboard, exact: true },
        { to: '/dashboard/admin/users', label: tr('users'), icon: Users },
        { to: '/dashboard/admin/users/new', label: tr('createUser'), icon: UserPlus },
        { to: '/dashboard/manager', label: tr('moderationHub'), icon: ShieldCheck },
      ],
    },
    MANAGER: {
      label: tr('roleManager'),
      icon: ShieldCheck,
      colorClass: 'text-amber-600',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      gradient: 'from-stone-900 via-amber-950 to-[#0F766E]',
      defaultNav: [
        { to: '/dashboard/manager', label: tr('overview'), icon: LayoutDashboard, exact: true },
        { to: '/dashboard/manager/listings', label: tr('listings'), icon: Home },
        { to: '/dashboard/manager/gis', label: tr('gisRequest'), icon: MapPin },
        { to: '/dashboard/manager/market', label: tr('market'), icon: ShoppingBag },
        { to: '/dashboard/manager/services', label: tr('services'), icon: Wrench },
        { to: '/dashboard/manager/jobs', label: tr('jobs'), icon: Briefcase },
      ],
    },
    AGENT: {
      label: tr('roleAgent'),
      icon: Home,
      colorClass: 'text-teal-600',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      gradient: 'from-slate-900 via-[#0F766E] to-teal-950',
      defaultNav: [
        { to: '/dashboard/agent', label: tr('overview'), icon: LayoutDashboard, exact: true },
        { to: '/dashboard/agent/listings', label: tr('myListings'), icon: Home },
        { to: '/dashboard/agent/listings/new', label: tr('createListing'), icon: PlusCircle },
        { to: '/dashboard/agent/gis', label: tr('assignedGis'), icon: MapPin },
      ],
    },
    CLIENT: {
      label: tr('roleClient'),
      icon: UserIcon,
      colorClass: 'text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      gradient: 'from-slate-900 via-sky-950 to-[#0F766E]',
      defaultNav: [
        { to: '/dashboard/client', label: tr('overview'), icon: LayoutDashboard, exact: true },
        { to: '/dashboard/client/market', label: tr('myMarketItems'), icon: ShoppingBag },
        { to: '/dashboard/client/jobs', label: tr('myJobs'), icon: Briefcase },
        { to: '/dashboard/client/applications', label: tr('myApplications'), icon: FileText },
        { to: '/dashboard/client/gis', label: tr('gisRequest'), icon: MapPin },
        { to: '/dashboard/client/services', label: tr('serviceProvider'), icon: Wrench },
      ],
    },
  };

  const currentRole = roleConfig[user.role] ?? roleConfig.CLIENT;
  const navList = navItems || currentRole.defaultNav;
  const RoleIcon = currentRole.icon;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#16241F] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* ============================================================ */}
      {/* 4.1 & 4.1b LEFT SIDEBAR (Desktop ≥1024px & Tablet 768-1023px) */}
      {/* ============================================================ */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[#E2E8E6] bg-white sticky top-0 h-screen z-30 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'w-[70px]' : 'w-[260px]'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand & Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8E6]">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <img src="/LOGO.png" alt="Duhuza" className="h-8 w-auto shrink-0" />
            {!isSidebarCollapsed && (
              <span className="font-heading font-extrabold text-lg text-[#0F766E] tracking-tight truncate">
                Duhuza
              </span>
            )}
          </Link>
        </div>

        {/* Role Pill Header */}
        {!isSidebarCollapsed ? (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${currentRole.badgeBg}`}
              >
                <RoleIcon className="h-3 w-3" />
                <span>{currentRole.label}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {user.isActive ? tr('active') : tr('suspended')}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate mt-1">{user.name}</p>
          </div>
        ) : (
          <div className="py-2.5 flex justify-center border-b border-gray-100 bg-gray-50/70" title={`${currentRole.label} (${user.name})`}>
            <span className={`inline-flex p-1.5 rounded-full border ${currentRole.badgeBg}`}>
              <RoleIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 scrollbar-thin">
          {navList.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                    : 'text-[#5B6B66] hover:bg-teal-50/60 hover:text-[#0F766E]'
                } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                {item.badge !== undefined && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    } ${isSidebarCollapsed ? 'absolute -top-1 -right-1 text-[10px] px-1' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#E2E8E6] bg-gray-50/50 space-y-2">
          {/* Language Switcher */}
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between gap-2 px-2 py-1 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-gray-400" />
                <span>{tr('language')}</span>
              </span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LanguageCode)}
                className="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700 focus:border-[#0F766E] focus:outline-none"
              >
                {(Object.keys(languageLabels) as LanguageCode[]).map((l) => (
                  <option key={l} value={l}>
                    {languageLabels[l]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            title={tr('logout')}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 transition ${
              isSidebarCollapsed ? 'justify-center px-1' : ''
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>{tr('logout')}</span>}
          </button>

          {/* Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold text-[#5B6B66] hover:bg-gray-200/70 transition"
            title={isSidebarCollapsed ? tr('expand') : tr('collapse')}
            aria-label={isSidebarCollapsed ? tr('expand') : tr('collapse')}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>{tr('collapse')}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE TOP BAR (<768px) */}
      {/* ============================================================ */}
      {isMobile && (
        <header className="sticky top-0 z-40 border-b border-[#E2E8E6] bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/LOGO.png" alt="Duhuza" className="h-7 w-auto" />
            <span className="font-heading font-extrabold text-base text-[#0F766E]">Duhuza</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${currentRole.badgeBg}`}
            >
              <RoleIcon className="h-3 w-3" />
              <span>{currentRole.label}</span>
            </span>

            {/* Mobile Profile & Language Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-[#0F766E] border border-teal-200 text-xs font-bold"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email || user.phone || '—'}</p>
                  </div>
                  <div className="py-1">
                    <div className="px-3 py-1.5 flex items-center justify-between text-xs text-gray-600">
                      <span>{tr('language')}</span>
                      <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value as LanguageCode)}
                        className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-700"
                      >
                        {(Object.keys(languageLabels) as LanguageCode[]).map((l) => (
                          <option key={l} value={l}>
                            {languageLabels[l]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 mt-1"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{tr('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Role Header Banner */}
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentRole.gradient} p-6 sm:p-8 text-white shadow-md`}
          >
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute left-1/4 bottom-0 -mb-10 h-40 w-40 rounded-full bg-teal-400/20 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${currentRole.badgeBg}`}
                  >
                    <RoleIcon className="h-3.5 w-3.5" />
                    <span>{currentRole.label}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {user.isActive ? tr('active') : tr('suspended')}
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {title}
                </h1>
                {subtitle && <p className="text-sm sm:text-base text-gray-200/90 max-w-2xl">{subtitle}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <div className="text-[11px] text-gray-300 uppercase tracking-wider">{tr('name')}</div>
                  <div className="text-sm font-bold text-white truncate max-w-[200px]">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-gray-300 font-mono truncate max-w-[200px]">
                    {user.email || user.phone || '—'}
                  </div>
                </div>
                {actions}
              </div>
            </div>
          </div>

          {/* Children Dashboard Content */}
          <div className="space-y-6">{children}</div>
        </main>
      </div>

      {/* ============================================================ */}
      {/* 4.2 BOTTOM TAB BAR (Mobile <768px Only) */}
      {/* ============================================================ */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8E6] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] flex items-center justify-around h-16 px-1 safe-area-bottom"
          aria-label="Mobile Bottom Navigation"
        >
          {navList.slice(0, 5).map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] py-1 text-center transition-colors ${
                  isActive ? 'text-[#0F766E] font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] truncate max-w-[64px]">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#0F766E]" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
