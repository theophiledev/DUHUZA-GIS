import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { languageLabels } from '../i18n/translations';
import type { LanguageCode } from '../types';
import { ToastContainer } from './Toast';
import { Map } from 'lucide-react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3.5 py-2 text-sm transition shrink-0 ${
    isActive
      ? 'bg-brand-active font-bold text-brand-700'
      : 'font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800'
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const { lang, setLang, tr } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-50 border-b border-gray-200/80"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="shrink-0 flex items-center">
            <img src="/LOGO.png" alt={tr('appName')} className="h-10 w-auto" />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>{tr('home')}</NavLink>
            <NavLink to="/listings" className={navLinkClass}>{tr('listings')}</NavLink>
            <NavLink to="/gis" className={`${navLinkClass} inline-flex items-center gap-2`}><Map size={18} strokeWidth={1.75} />{tr('gisNav')}</NavLink>
            <NavLink to="/market" className={navLinkClass}>{tr('market')}</NavLink>
            <NavLink to="/services" className={navLinkClass}>{tr('services')}</NavLink>
            <NavLink to="/jobs" className={navLinkClass}>{tr('jobs')}</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="rounded-lg border border-gray-200 bg-white/80 px-2 py-1.5 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              aria-label={tr('language')}
            >
              {(Object.keys(languageLabels) as LanguageCode[]).map((l) => (
                <option key={l} value={l}>{languageLabels[l]}</option>
              ))}
            </select>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="rounded-full bg-brand-active px-3 py-1.5 text-xs sm:text-sm font-semibold text-brand-800 hover:bg-emerald-100 transition"
                >
                  {tr('dashboard')}
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  title={tr('myProfile')}
                >
                  <span>{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-xs sm:text-sm font-medium text-gray-500 hover:text-red-700 transition px-1 py-1.5"
                >
                  {tr('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-brand-700">
                  {tr('login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  {tr('register')}
                </Link>
              </div>
            )}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
          <NavLink to="/" end className={navLinkClass}>{tr('home')}</NavLink>
          <NavLink to="/listings" className={navLinkClass}>{tr('listings')}</NavLink>
          <NavLink to="/gis" className={`${navLinkClass} inline-flex items-center gap-2`}><Map size={18} strokeWidth={1.75} />{tr('gisNav')}</NavLink>
          <NavLink to="/market" className={navLinkClass}>{tr('market')}</NavLink>
          <NavLink to="/services" className={navLinkClass}>{tr('services')}</NavLink>
          <NavLink to="/jobs" className={navLinkClass}>{tr('jobs')}</NavLink>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Duhuza — {tr('tagline')}
      </footer>

      <ToastContainer />
    </div>
  );
}
