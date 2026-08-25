import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api';
import { Button, Card, ErrorAlert, Input, PageHeader, Select } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { LanguageCode } from '../types';

export function RegisterPage() {
  const { lang, tr } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', preferredLanguage: lang as LanguageCode });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiRegister({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        preferredLanguage: form.preferredLanguage,
      });
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title={tr('register')} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={tr('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label={tr('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label={tr('phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label={tr('password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          <Select label={tr('language')} value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as LanguageCode })}>
            <option value="RW">Kinyarwanda</option>
            <option value="EN">English</option>
            <option value="SW">Kiswahili</option>
          </Select>
          {error && <ErrorAlert message={error} />}
          <Button type="submit" disabled={loading} className="w-full">{loading ? tr('loading') : tr('register')}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {tr('alreadyHaveAccount')} <Link to="/login" className="font-semibold text-brand-700">{tr('login')}</Link>
        </p>
      </Card>
    </div>
  );
}
