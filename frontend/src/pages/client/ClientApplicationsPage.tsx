import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myApplications } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { Job } from '../../types';

export function ClientApplicationsPage() {
  const { tr } = useLanguage();
  const [apps, setApps] = useState<{ id: string; appliedAt: string; status: string; job: Job }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    myApplications()
      .then(setApps)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout
      title={tr('myApplications')}
      subtitle="Track your submitted job applications and candidate review status."
      actions={
        <Link to="/jobs">
          <Button variant="secondary">🔍 Browse Available Jobs</Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && apps.length === 0 && (
        <EmptyState message="You have not submitted any job applications yet." />
      )}

      <div className="space-y-4">
        {apps.map((a) => (
          <Card key={a.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{a.job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applied on: {new Date(a.appliedAt).toLocaleDateString()} · 📍 {a.job.location || 'Rwanda'}
                </p>
              </div>
              <StatusBadge status={a.status || 'SUBMITTED'} />
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg">
              {a.job.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400">Application Reference: {a.id.slice(0, 8)}...</span>
              <Link to={`/jobs/${a.job.id}`} className="font-semibold text-brand-700 hover:underline">
                View Job Post ↗
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
