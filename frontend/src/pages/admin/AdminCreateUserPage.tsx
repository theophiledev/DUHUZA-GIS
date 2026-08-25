import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, ErrorAlert, Input, Select } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { LanguageCode, Role } from '../../types';

export function AdminCreateUserPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'AGENT' as Role,
    preferredLanguage: 'RW' as LanguageCode,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUser({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
        preferredLanguage: form.preferredLanguage,
      });
      navigate('/dashboard/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions: Record<Role, string> = {
    AGENT: 'Real estate professional and certified GIS field surveyor. Can submit property listings and execute assigned parcel surveys.',
    MANAGER: 'Operations supervisor and moderation controller. Can review, approve, reject, or reassign submissions across 5 platform verticals.',
    ADMIN: 'Master administrator with full system authority, permission overrides, and user credential provisioning.',
    CLIENT: 'Standard self-serve client.',
  };

  return (
    <DashboardLayout
      title={tr('createUser')}
      subtitle="Provision privileged Agent, Manager, or Admin accounts with verified credentials (FR1)."
      actions={
        <Link to="/dashboard/admin/users">
          <Button variant="secondary">← Back to Users Directory</Button>
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorAlert message={error} />}

            <div className="space-y-4">
              <Input
                label={tr('name')}
                placeholder="e.g. Jean Damascene Hakizimana"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={tr('email')}
                  type="email"
                  placeholder="name@domain.rw"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label={tr('phone')}
                  placeholder="+250 788 123 456"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <Input
                label={tr('password')}
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label={tr('role')}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                >
                  <option value="AGENT">AGENT (Property & GIS Surveyor)</option>
                  <option value="MANAGER">MANAGER (Moderator & Dispatcher)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </Select>

                <Select
                  label={tr('language')}
                  value={form.preferredLanguage}
                  onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as LanguageCode })}
                >
                  <option value="RW">Kinyarwanda (Default)</option>
                  <option value="EN">English</option>
                  <option value="SW">Kiswahili</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link to="/dashboard/admin/users">
                <Button variant="secondary" type="button">
                  {tr('cancel')}
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="px-6 shadow-md">
                {loading ? tr('loading') : `Provision ${form.role} Account`}
              </Button>
            </div>
          </form>
        </Card>

        {/* Role Helper Info Card */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 p-5">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <span>💡</span>
              <span>Selected Role: {form.role}</span>
            </h4>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              {roleDescriptions[form.role]}
            </p>
            <div className="mt-4 pt-3 border-t border-indigo-100/80 text-xs text-indigo-900 font-medium">
              🔒 Note: Agents and Managers can only be created by an Admin (FR1, BR11).
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
