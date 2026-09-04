import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { changePassword, getProfile, updateProfile as apiUpdateProfile } from '../api';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button, Card, ErrorAlert, Input } from '../components/ui';
import { showToast } from '../components/Toast';
import { languageLabels } from '../i18n/translations';
import type { LanguageCode } from '../types';
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  Lock,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  Layers,
  Save,
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { setLang, tr } = useLanguage();

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'permissions'>('details');

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLang, setPreferredLang] = useState<LanguageCode>(user?.preferredLanguage || 'EN');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Profile Analytics / Counts from backend
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setPreferredLang(user.preferredLanguage || 'EN');
    }

    const loadProfileData = async () => {
      try {
        const res = await getProfile();
        if (res?.counts) setCounts(res.counts);
      } catch {
        // graceful fallback if offline
      }
    };
    loadProfileData();
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await apiUpdateProfile({
        name,
        phone: phone || undefined,
        preferredLanguage: preferredLang,
      });

      updateUser(res.user);
      setLang(preferredLang);
      setProfileSuccess(tr('profileUpdatedSuccess'));
      showToast(tr('profileUpdatedSuccess'), 'success');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(tr('passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(tr('passwordChangedSuccess'));
      showToast(tr('passwordChangedSuccess'), 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'MANAGER':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'AGENT':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Member';

  return (
    <DashboardLayout
      title={tr('myProfile')}
      subtitle="Manage your personal information, credentials, security sessions, and account permissions."
    >
      <div className="space-y-6">
        {/* ============================================================ */}
        {/* 1. HERO IDENTITY CARD */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E2E8E6] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F766E] to-teal-700 text-2xl font-extrabold text-white shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-xl font-extrabold text-gray-900">{user.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    <span>{user.role}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {user.isActive ? tr('active') : tr('suspended')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                  {user.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {tr('memberSince')}: {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-center px-3 py-1 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-[10px] uppercase font-bold text-gray-400">Account ID</div>
                <div className="font-mono text-xs font-bold text-gray-700 mt-0.5">
                  {user.id.slice(0, 8)}...
                </div>
              </div>
              <div className="text-center px-3 py-1 bg-teal-50 rounded-xl border border-teal-200">
                <div className="text-[10px] uppercase font-bold text-[#0F766E]">Language</div>
                <div className="text-xs font-bold text-teal-900 mt-0.5">
                  {languageLabels[user.preferredLanguage || 'EN']}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. TAB CONTROLS */}
        {/* ============================================================ */}
        <div className="flex border-b border-gray-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>{tr('personalInfo')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'security'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>{tr('securitySettings')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'permissions'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Role & Activity Overview</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* 3. TAB 1: PERSONAL INFORMATION & EDIT PROFILE */}
        {/* ============================================================ */}
        {activeTab === 'details' && (
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-8 p-6 space-y-5 border border-[#E2E8E6]">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-heading font-bold text-base text-gray-900">
                  {tr('personalInfo')}
                </h3>
                <p className="text-xs text-gray-500">
                  Update your contact info and personal preferences across Duhuza.
                </p>
              </div>

              {profileError && <ErrorAlert message={profileError} />}
              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 animate-fadeIn">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label={tr('name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={tr('phone')}
                    placeholder="e.g. +250 788 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      {tr('language')}
                    </label>
                    <div className="relative">
                      <select
                        value={preferredLang}
                        onChange={(e) => setPreferredLang(e.target.value as LanguageCode)}
                        className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
                      >
                        {(Object.keys(languageLabels) as LanguageCode[]).map((l) => (
                          <option key={l} value={l}>
                            {languageLabels[l]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={profileLoading} className="font-bold">
                    <Save className="h-4 w-4" />
                    <span>{profileLoading ? tr('loading') : tr('save')}</span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Inactivity Security Sidecard */}
            <Card className="md:col-span-4 p-6 space-y-4 bg-teal-50/40 border border-teal-200">
              <div className="flex items-center gap-2 text-[#0F766E]">
                <Clock className="h-5 w-5" />
                <h4 className="font-heading font-bold text-sm text-gray-900">
                  {tr('sessionSecurity')}
                </h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {tr('sessionSecurityDesc')}
              </p>
              <div className="rounded-xl border border-teal-200/80 bg-white p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Idle Timeout:</span>
                  <strong className="text-emerald-700 font-bold">10 Minutes</strong>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Warning Alert:</span>
                  <strong className="text-amber-700 font-bold">At 9 Minutes</strong>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Protection
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. TAB 2: SECURITY & PASSWORD CHANGE */}
        {/* ============================================================ */}
        {activeTab === 'security' && (
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-7 p-6 space-y-5 border border-[#E2E8E6]">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-heading font-bold text-base text-gray-900">
                  {tr('changePassword')}
                </h3>
                <p className="text-xs text-gray-500">
                  Keep your account secure by using a strong password of at least 8 characters.
                </p>
              </div>

              {passwordError && <ErrorAlert message={passwordError} />}
              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 animate-fadeIn">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    {tr('currentPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    {tr('newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    {tr('confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPass"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <label htmlFor="showPass" className="text-xs text-gray-600 font-medium cursor-pointer">
                    Show passwords
                  </label>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={passwordLoading} className="font-bold">
                    <KeyRound className="h-4 w-4" />
                    <span>{passwordLoading ? tr('loading') : tr('changePassword')}</span>
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="md:col-span-5 p-6 space-y-4 border border-[#E2E8E6]">
              <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
                <span>Security Recommendations</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Use at least 8 characters with a mix of letters, numbers, and symbols.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Do not share your password or verification codes with anyone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Sessions automatically terminate after 10 minutes of inactivity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Always log out when accessing Duhuza on public or shared workstations.</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. TAB 3: ROLE & PERMISSIONS & METRICS */}
        {/* ============================================================ */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4 border border-[#E2E8E6] space-y-1">
                <div className="text-xs text-gray-500 font-medium">Assigned Role</div>
                <div className="text-lg font-extrabold text-gray-900">{user.role}</div>
                <div className="text-[11px] text-teal-700">Platform Access Level</div>
              </Card>

              <Card className="p-4 border border-[#E2E8E6] space-y-1">
                <div className="text-xs text-gray-500 font-medium">Account Status</div>
                <div className="text-lg font-extrabold text-emerald-700">
                  {user.isActive ? 'Active' : 'Suspended'}
                </div>
                <div className="text-[11px] text-gray-500">Verified Credentials</div>
              </Card>

              {user.role === 'MANAGER' || user.role === 'ADMIN' ? (
                <>
                  <Card className="p-4 border border-[#E2E8E6] space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Moderation Scope</div>
                    <div className="text-lg font-extrabold text-purple-800">Multi-Vertical</div>
                    <div className="text-[11px] text-gray-500">Full Governance Access</div>
                  </Card>
                  <Card className="p-4 border border-[#E2E8E6] space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Auto-Triage Hub</div>
                    <div className="text-lg font-extrabold text-amber-800">Enabled</div>
                    <div className="text-[11px] text-gray-500">Live Queue Streams</div>
                  </Card>
                </>
              ) : user.role === 'AGENT' ? (
                <>
                  <Card className="p-4 border border-[#E2E8E6] space-y-1">
                    <div className="text-xs text-gray-500 font-medium">My Listings</div>
                    <div className="text-lg font-extrabold text-[#0F766E]">
                      {counts.listings ?? 0}
                    </div>
                    <div className="text-[11px] text-gray-500">Published Properties</div>
                  </Card>
                  <Card className="p-4 border border-[#E2E8E6] space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Assigned Surveys</div>
                    <div className="text-lg font-extrabold text-emerald-700">
                      {counts.gisRequestsAssigned ?? 0}
                    </div>
                    <div className="text-[11px] text-gray-500">Cadastral Missions</div>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="p-4 border border-[#E2E8E6] space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Marketplace Items</div>
                    <div className="text-lg font-extrabold text-[#0F766E]">
                      {counts.marketItems ?? 0}
                    </div>
                    <div className="text-[11px] text-gray-500">Isoko Listings</div>
                  </Card>
                  <Card className="p-4 border border-[#E2E8E6] space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Job Applications</div>
                    <div className="text-lg font-extrabold text-blue-700">
                      {counts.applications ?? 0}
                    </div>
                    <div className="text-[11px] text-gray-500">Submitted CVs</div>
                  </Card>
                </>
              )}
            </div>

            {/* Role Capabilities Breakdown */}
            <Card className="p-6 border border-[#E2E8E6] space-y-4">
              <h3 className="font-heading font-bold text-base text-gray-900">
                Granted Capabilities & Moderation Authority
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <ShieldCheck className="h-5 w-5 text-[#0F766E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-bold text-gray-900">
                      Authentication & Session Policy
                    </strong>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Bearer JWT authorization with 10-minute idle auto-termination for secure data integrity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <ShieldCheck className="h-5 w-5 text-[#0F766E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-bold text-gray-900">
                      Multi-Vertical Access
                    </strong>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Access to real estate listings, GIS surveys, Isoko marketplace items, and job listings based on role privileges.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
