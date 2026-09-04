import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api';
import { Button, Card, ErrorAlert, Input, PageHeader } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { showToast } from '../components/Toast';
import {
  KeyRound,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function ForgotPasswordPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Request OTP Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await forgotPassword(identifier);
      if (res.resetCode) {
        setDevCodeHint(res.resetCode);
        setResetCode(res.resetCode);
      }
      showToast(tr('codeSentNotice'), 'success');
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset Code & New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(tr('passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword(identifier, resetCode, newPassword);
      showToast(tr('passwordResetSuccess'), 'success');
      navigate('/login?reset=success');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(newPassword);

  return (
    <div className="mx-auto max-w-md space-y-5 py-6">
      <PageHeader
        title={step === 1 ? tr('forgotPassword') : tr('resetPassword')}
        subtitle={step === 1 ? tr('forgotPasswordSubtitle') : tr('resetPasswordSubtitle')}
      />

      <Card className="shadow-md border-gray-200">
        {step === 1 ? (
          /* STEP 1: Enter Identifier */
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3.5 text-xs text-teal-900 leading-relaxed flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>
                Enter the email address or phone number associated with your Duhuza account. We will issue a 6-digit verification code.
              </span>
            </div>

            <Input
              label={tr('identifier')}
              placeholder="e.g. user@domain.com or 0788123456"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />

            {error && <ErrorAlert message={error} />}

            <Button type="submit" disabled={loading} className="w-full font-bold">
              <KeyRound className="h-4 w-4" />
              <span>{loading ? tr('loading') : tr('sendResetCode')}</span>
            </Button>
          </form>
        ) : (
          /* STEP 2: Enter Code & New Password */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {devCodeHint && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Verification Code Issued:</span>
                </div>
                <div className="font-mono text-base font-extrabold text-emerald-800 tracking-wider">
                  {devCodeHint}
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">Expires in 15 minutes.</p>
              </div>
            )}

            <Input
              label={tr('resetCode')}
              placeholder="123456"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
              maxLength={6}
              className="font-mono tracking-widest text-center text-lg font-bold"
            />

            <div className="space-y-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                {tr('newPassword')}
              </span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 pr-10 text-sm text-gray-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="pt-1 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full">
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 1 ? 'bg-red-500' : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 2 ? 'bg-amber-500' : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 3 ? 'bg-teal-500' : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 4 ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {strength <= 1 && 'Weak password'}
                    {strength === 2 && 'Fair password'}
                    {strength === 3 && 'Good password'}
                    {strength >= 4 && 'Strong password (mix of upper, numbers & symbols)'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                {tr('confirmPassword')}
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-gray-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100 ${
                  confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : 'border-[#E2E8E6]'
                }`}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{tr('passwordsDoNotMatch')}</span>
                </p>
              )}
            </div>

            {error && <ErrorAlert message={error} />}

            <Button type="submit" disabled={loading} className="w-full font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? tr('loading') : tr('resetPassword')}</span>
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Request a different code
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{tr('backToLogin')}</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
