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
import { ManagerItemDetailModal, type ManagerItemDetailData } from '../../components/ManagerItemDetailModal';
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
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailModalItem, setDetailModalItem] = useState<ManagerItemDetailData | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: '',
    title: '',
  });
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: string; title: string }>({
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

  const handleApprove = async (id: string, title: string) => {
    setApproveDialog({ open: true, id, title });
  };

  const handleApproveConfirm = async (comment?: string) => {
    if (!approveDialog.id) return;
    setActionLoading(true);
    try {
      await approveJob(approveDialog.id, comment);
      showToast('Job posting approved and published live!', 'success');
      setApproveDialog({ open: false, id: '', title: '' });
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
            submitterInfo={
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                  {job.employer?.name ? job.employer.name.charAt(0).toUpperCase() : 'E'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                    <span>{job.employer?.name || 'Employer'}</span>
                    <span className="rounded bg-blue-50 px-1 py-0.2 text-[10px] font-bold text-blue-800">EMPLOYER</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono-data">
                    {job.employer?.phone || job.employer?.email || '—'}
                  </div>
                </div>
              </div>
            }
            onInspect={() =>
              setDetailModalItem({
                id: job.id,
                type: 'job',
                typeLabel: 'Job Vacancy',
                title: job.title,
                status: job.status,
                location: job.location,
                salaryRange: job.salaryRange,
                deadline: job.deadline,
                description: job.description,
                createdAt: job.createdAt,
                submitter: job.employer,
              })
            }
            onApprove={() => handleApprove(job.id, job.title)}
            onReject={() => setRejectDialog({ open: true, id: job.id, title: job.title })}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={approveDialog.open}
        title={`Approve Job Vacancy: ${approveDialog.title}`}
        message="This job posting will be published live immediately. You can optionally add comments about the posting quality or credibility."
        confirmLabel="✓ Approve & Publish"
        cancelLabel={tr('cancel')}
        variant="primary"
        requireComment={false}
        commentLabel="Optional Approval Feedback (visible to public):"
        commentPlaceholder="E.g., Verified employer, competitive salary, clear role description..."
        isLoading={actionLoading}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveDialog({ open: false, id: '', title: '' })}
      />

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

      {/* Full Detail Inspection Modal */}
      <ManagerItemDetailModal
        isOpen={Boolean(detailModalItem)}
        item={detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onApprove={async (id, comment) => {
          setActionLoading(true);
          try {
            await approveJob(id, comment);
            showToast('Job vacancy approved and published live!', 'success');
            setDetailModalItem(null);
            load();
          } catch (e) {
            alert(e instanceof Error ? e.message : tr('error'));
          } finally {
            setActionLoading(false);
          }
        }}
        onReject={async (id, comment) => {
          setActionLoading(true);
          try {
            await rejectJob(id, comment);
            showToast('Job vacancy rejected with feedback logged.', 'info');
            setDetailModalItem(null);
            load();
          } catch (e) {
            alert(e instanceof Error ? e.message : tr('error'));
          } finally {
            setActionLoading(false);
          }
        }}
        actionLoading={actionLoading}
      />
    </DashboardLayout>
  );
}
