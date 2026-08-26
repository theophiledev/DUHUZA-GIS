import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myJobs } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { Job } from '../../types';
import { PlusCircle, ExternalLink, Users, MapPin } from 'lucide-react';

export function ClientJobsPage() {
  const { tr } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    myJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout
      title={tr('myJobs')}
      subtitle="Manage your posted vacancies, review applicants, and track candidate submissions."
      actions={
        <Link to="/dashboard/client/jobs/new">
          <Button variant="primary" className="flex items-center gap-1.5 font-bold shadow-xs">
            <PlusCircle className="h-4 w-4" />
            <span>{tr('postJob')}</span>
          </Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && jobs.length === 0 && (
        <EmptyState
          message="You have not posted any job vacancies yet."
          actionLabel={`+ ${tr('postJob')}`}
          onAction={() => (window.location.href = '/dashboard/client/jobs/new')}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map((job) => {
          const normStatus = job.status.toLowerCase().replace(/_/g, '-');

          return (
            <Card
              key={job.id}
              statusRail={normStatus as any}
              className="p-5 border-[#E2E8E6] shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-base">{job.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{job.location || 'Rwanda'}</span> · Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              {job.salaryRange && (
                <span className="inline-block text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  Salary: {job.salaryRange}
                </span>
              )}

              <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg">
                {job.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-800">
                  <Users className="h-3 w-3" />
                  <span>{job._count?.applications ?? 0} {tr('applicantsCount')}</span>
                </span>

                {job.status === 'PUBLISHED' && (
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-0.5"
                  >
                    <span>View Public Board</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
