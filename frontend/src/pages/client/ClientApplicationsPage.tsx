import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myApplications } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { Job } from '../../types';
import { Search, ExternalLink, MapPin } from 'lucide-react';

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
          <Button variant="secondary" className="flex items-center gap-1.5 font-semibold shadow-xs">
            <Search className="h-4 w-4 text-[#0F766E]" />
            <span>Browse Available Jobs</span>
          </Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && apps.length === 0 && (
        <EmptyState
          message="You have not submitted any job applications yet."
          actionLabel="Browse Open Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      )}

      <div className="space-y-4">
        {apps.map((a) => (
          <Card
            key={a.id}
            statusRail="pending"
            className="p-5 border-[#E2E8E6] shadow-sm hover:shadow-md transition space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-bold text-gray-900">{a.job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applied on: {new Date(a.appliedAt).toLocaleDateString()} · <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{a.job.location || 'Rwanda'}</span>
                </p>
              </div>
              <StatusBadge status={a.status || 'SUBMITTED'} />
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg">
              {a.job.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400 font-mono-data">Application ID: {a.id.slice(0, 8)}...</span>
              <Link
                to={`/jobs/${a.job.id}`}
                className="font-bold text-[#0F766E] hover:underline flex items-center gap-0.5"
              >
                <span>View Job Post</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
