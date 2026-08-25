import { useEffect, useState } from 'react';
import { myServiceProfile, registerServiceProvider } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, ErrorAlert, Input, LoadingSpinner, Select, StatusBadge, Textarea } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { ServiceProvider } from '../../types';

export function ClientServicePage() {
  const { tr } = useLanguage();
  const [profile, setProfile] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    category: 'Plumbing & Electrical',
    description: '',
    rateInfo: '10,000 RWF/visit',
    coverageDistrict: 'Kigali (Gasabo, Kicukiro, Nyarugenge)',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    myServiceProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const p = await registerServiceProvider(form);
      setProfile(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title={tr('serviceProvider')}
      subtitle="Register or manage your certified professional profile (plumbing, electrical, transport, tutoring, tailoring)."
    >
      {loading ? (
        <LoadingSpinner label={tr('loading')} />
      ) : profile ? (
        <div className="max-w-2xl space-y-6">
          <Card className="p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1 capitalize">
                  {profile.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">Active Service Profile</h3>
                <p className="text-xs text-gray-500">
                  Coverage Area: <strong>{profile.coverageDistrict || 'Rwanda'}</strong>
                </p>
              </div>
              <StatusBadge status={profile.status} />
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed">
              {profile.description}
            </div>

            {profile.rateInfo && (
              <div className="text-sm font-semibold text-brand-700">
                Rate / Pricing: <span className="font-bold">{profile.rateInfo}</span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{profile.status === 'PUBLISHED' ? '✓ Visible to clients on Services directory' : '⏳ Under manager review'}</span>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="max-w-2xl p-6 border border-gray-200 shadow-sm">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-lg font-bold text-gray-900">{tr('registerAsProvider')}</h3>
            <p className="text-xs text-gray-500">
              Reach clients in your district looking for certified trades & specialized services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorAlert message={error} />}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Select
                  label={tr('category')}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                  <option value="Transport & Logistics">Transport & Logistics</option>
                  <option value="Tutoring & Training">Tutoring & Training</option>
                  <option value="Tailoring & Design">Tailoring & Design</option>
                  <option value="Construction & Masonry">Construction & Masonry</option>
                  <option value="Cleaning & Gardening">Cleaning & Gardening</option>
                  <option value="Other Trades">Other Trades</option>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  label={tr('description')}
                  placeholder="Describe your skills, years of experience, tools, certifications, and availability..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <Input
                label="Standard Rates / Pricing Info"
                value={form.rateInfo}
                onChange={(e) => setForm({ ...form, rateInfo: e.target.value })}
                placeholder="e.g. 10,000 RWF/hour or flat rate"
              />

              <Input
                label="Coverage District / Sectors"
                value={form.coverageDistrict}
                onChange={(e) => setForm({ ...form, coverageDistrict: e.target.value })}
                placeholder="e.g. Kigali, Musanze"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button type="submit" disabled={submitting} className="px-6 shadow-md">
                {submitting ? tr('loading') : 'Submit Profile for Verification'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </DashboardLayout>
  );
}
