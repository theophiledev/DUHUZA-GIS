import { useEffect, useState } from 'react';
import { approveJob, pendingJobs, rejectJob } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  ReviewCard,
} from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { Job } from '../../types';

function getJobSampleImage(title: string) {
  const t = (title || '').toLowerCase();
  if (t.includes('survey') || t.includes('field') || t.includes('gis') || t.includes('land')) return '/images/gis_field_surveyor.jpg';
  if (t.includes('developer') || t.includes('tech') || t.includes('engineer')) return '/images/office_commercial_kigali.jpg';
  if (t.includes('marketing') || t.includes('design') || t.includes('content')) return '/images/market_smartphone.jpg';
  if (t.includes('intern') || t.includes('operations') || t.includes('logistics') || t.includes('agri')) return '/images/warehouse_logistics.jpg';
  return '/images/commercial_kigali.jpg';
}

export function ManagerJobsPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<(Job & { employer: { name: string; phone?: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: '',
    title: '',
  });
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
      showToast('Job posting approved and published live!', 'success');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (comment?: string) => {
    if (!rejectDialog.id || !comment) return;
    setActionLoading(true);
    try {
      await rejectJob(rejectDialog.id, comment);
      showToast('Job posting rejected with feedback logged.', 'info');
      setRejectDialog({ open: false, id: '', title: '' });
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
        <EmptyState message="Nothing pending — you're caught up." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((job) => (
          <ReviewCard
            key={job.id}
            id={job.id}
            title={job.title}
            status={job.status}
            location={job.location || 'Rwanda'}
            tags={job.salaryRange ? [job.salaryRange] : undefined}
            description={job.description}
            imageUrl={getJobSampleImage(job.title)}
            submitterInfo={`Employer: ${job.employer?.name || '—'} (${job.employer?.phone || '—'})`}
            onApprove={() => handleApprove(job.id)}
            onReject={() => setRejectDialog({ open: true, id: job.id, title: job.title })}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={rejectDialog.open}
        title={`Reject Job Vacancy: ${rejectDialog.title}`}
        message="State why this job posting cannot be published at this time."
        confirmLabel="Confirm Rejection"
        cancelLabel={tr('cancel')}
        variant="danger"
        requireComment={true}
        commentLabel="Mandatory Rejection Feedback:"
        commentPlaceholder="Explain required updates (e.g. unrealistic salary format, missing employer contact info)..."
        minCommentLength={3}
        isLoading={actionLoading}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectDialog({ open: false, id: '', title: '' })}
      />
    </DashboardLayout>
  );
}
