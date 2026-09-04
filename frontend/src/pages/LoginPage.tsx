import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login as apiLogin } from '../api';
import { Button, Card, ErrorAlert, Input, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff, Lock, Clock, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { tr } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('duhuza_logout_reason') : null);
  const resetSuccess = searchParams.get('reset') === 'success';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('duhuza_logout_reason');
      }
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
    <div className="mx-auto max-w-md space-y-5 py-6">
      <PageHeader title={tr('login')} subtitle={tr('welcomeBack')} />

      {/* Inactivity Logout Notice */}
      {reason === 'inactivity' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-sm animate-fadeIn">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs font-medium leading-relaxed">
            <strong className="font-bold block text-amber-950 text-sm mb-0.5">Session Timed Out</strong>
            {tr('sessionExpiredDueToInactivity')}
          </div>
        </div>
      )}

      {/* Reset Password Success Banner */}
      {resetSuccess && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs font-medium leading-relaxed">
            <strong className="font-bold block text-emerald-950 text-sm mb-0.5">Password Updated</strong>
            {tr('passwordResetSuccess')}
          </div>
        </div>
      )}

      <Card className="shadow-md border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={tr('identifier')}
            placeholder="email@example.com or 0788123456"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                {tr('password')}
              </span>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#0F766E] hover:underline"
              >
                {tr('forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 pr-10 text-sm text-gray-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <ErrorAlert message={error} />}

          <Button type="submit" disabled={loading} className="w-full font-bold">
            <Lock className="h-4 w-4" />
            <span>{loading ? tr('loading') : tr('login')}</span>
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <p className="text-sm text-gray-600">
            {tr('noAccount')}{' '}
            <Link to="/register" className="font-bold text-[#0F766E] hover:underline">
              {tr('register')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
