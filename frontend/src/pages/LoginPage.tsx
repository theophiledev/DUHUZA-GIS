import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api';
import { Button, Card, ErrorAlert, Input, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function LoginPage() {
  const { tr } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(identifier, password);
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
      <PageHeader title={tr('login')} subtitle={tr('welcomeBack')} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={tr('identifier')} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          <Input label={tr('password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <ErrorAlert message={error} />}
          <Button type="submit" disabled={loading} className="w-full">{loading ? tr('loading') : tr('login')}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {tr('noAccount')} <Link to="/register" className="font-semibold text-brand-700">{tr('register')}</Link>
        </p>
      </Card>
    </div>
  );
}
