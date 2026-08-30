import { useEffect, useState } from 'react';
import { myServiceProfile, registerServiceProvider } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, ErrorAlert, Input, LoadingSpinner, Select, StatusBadge, Textarea } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { ServiceProvider } from '../../types';
import { Wrench, CheckCircle2, Clock } from 'lucide-react';

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
      showToast('Service provider profile registered successfully!', 'success');
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
          <Card
            statusRail={profile.status === 'PUBLISHED' ? 'published' : 'pending'}
            className="p-6 border-[#E2E8E6] shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1 capitalize">
                  {profile.category}
                </span>
                <h3 className="font-heading text-xl font-bold text-gray-900 mt-2">Active Service Profile</h3>
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
              <div className="text-sm font-semibold text-[#0F766E]">
                Rate / Pricing: <span className="font-bold">{profile.rateInfo}</span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                {profile.status === 'PUBLISHED' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Visible to clients on Services directory</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Under manager verification review</span>
                  </>
                )}
              </span>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="max-w-2xl p-6 border-[#E2E8E6] shadow-sm">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#0F766E]" />
              <span>{tr('registerAsProvider')}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Reach clients in your district looking for certified trades & specialized services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="region" aria-live="polite">
                <ErrorAlert message={error} />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Select
                  label={tr('category')}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                  <option value="Carpentry & Masonry">Carpentry & Masonry</option>
                  <option value="Transport & Moving">Transport & Moving</option>
                  <option value="Cleaning & Gardening">Cleaning & Gardening</option>
                  <option value="Painting & Renovation">Painting & Renovation</option>
                  <option value="Tutoring & IT Support">Tutoring & IT Support</option>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Coverage District / Area"
                  placeholder="e.g. Kigali (Gasabo, Kicukiro, Nyarugenge) or Musanze"
                  value={form.coverageDistrict}
                  onChange={(e) => setForm({ ...form, coverageDistrict: e.target.value })}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Standard Rate / Pricing Terms"
                  placeholder="e.g. 15,000 RWF per visit / diagnostic"
                  value={form.rateInfo}
                  onChange={(e) => setForm({ ...form, rateInfo: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  label="Service Description & Credentials"
                  placeholder="Describe your skills, years of experience, certifications, and availability..."
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button type="submit" disabled={submitting} className="font-bold shadow-xs">
                {submitting ? tr('loading') : 'Submit for review'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </DashboardLayout>
  );
}
