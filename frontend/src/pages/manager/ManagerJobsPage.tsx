import { useEffect, useState } from 'react';
import { approveJob, pendingJobs, rejectJob } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { Job } from '../../types';

export function ManagerJobsPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<(Job & { employer: { name: string; phone?: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    pendingJobs()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await approveJob(id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectComment.trim()) return;
    setActionLoading(true);
    try {
      await rejectJob(rejectId, rejectComment);
      setRejectId(null);
      setRejectComment('');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={`${tr('jobs')} — ${tr('pendingQueue')}`}
      subtitle="Review employer job vacancies, salary terms, and application criteria."
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No pending job postings waiting for review." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((job) => (
          <Card key={job.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Employer: <span className="font-semibold text-gray-800">{job.employer.name}</span> ({job.employer.phone || '—'}) · 📍 {job.location || 'Rwanda'}
                </p>
              </div>
              {job.salaryRange && (
                <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded">
                  {job.salaryRange}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 line-clamp-3">
              {job.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => {
                  setRejectId(job.id);
                  setRejectComment('');
                }}
                disabled={actionLoading}
              >
                {tr('reject')}
              </Button>
              <Button
                variant="primary"
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleApprove(job.id)}
                disabled={actionLoading}
              >
                ✓ {tr('approve')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Job Posting Rejection Reason</h3>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Explain why this job posting is rejected..."
              rows={4}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none"
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRejectId(null)}>
                {tr('cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={actionLoading || rejectComment.trim().length < 3}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
