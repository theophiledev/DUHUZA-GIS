import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myJobs } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { Job } from '../../types';

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
          <Button variant="primary">➕ {tr('postJob')}</Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && jobs.length === 0 && (
        <EmptyState message="You have not posted any job vacancies yet." />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map((job) => (
          <Card key={job.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  📍 {job.location || 'Rwanda'} · Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {job.salaryRange && (
              <span className="inline-block text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Salary: {job.salaryRange}
              </span>
            )}

            <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg">
              {job.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-800">
                👥 {job._count?.applications ?? 0} {tr('applicantsCount')}
              </span>

              {job.status === 'PUBLISHED' && (
                <Link to={`/jobs/${job.id}`} className="text-xs font-bold text-brand-700 hover:underline">
                  View Public Board ↗
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
