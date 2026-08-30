import { useEffect, useState } from 'react';
import { approveService, pendingServices, rejectService } from '../../api';
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

function getServiceSampleImage(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('electric') || cat.includes('solar')) return '/images/service_electrician.jpg';
  if (cat.includes('paint')) return '/images/service_painting.jpg';
  if (cat.includes('mechanic') || cat.includes('auto')) return '/images/service_mechanic.jpg';
  if (cat.includes('cater') || cat.includes('chef') || cat.includes('event')) return '/images/service_catering.jpg';
  if (cat.includes('plumb')) return '/images/service_plumbing.jpg';
  if (cat.includes('gis') || cat.includes('survey')) return '/images/service_surveyor.jpg';
  return '/images/service_surveyor.jpg';
}

export function ManagerServicesPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<
    {
      id: string;
      category: string;
      description: string;
      rateInfo?: string | null;
      coverageDistrict?: string | null;
      user: { name: string; phone?: string };
    }[]
  >([]);
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
    pendingServices()
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
      await approveService(id);
      showToast('Service provider verified and approved successfully!', 'success');
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
      await rejectService(rejectDialog.id, comment);
      showToast('Service provider registration rejected.', 'info');
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
      title={`${tr('services')} — ${tr('pendingQueue')}`}
      subtitle="Verify tradespeople and professional service providers (plumbing, transport, tutoring, tailoring, etc.)."
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="Nothing pending — you're caught up." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((p) => (
          <ReviewCard
            key={p.id}
            id={p.id}
            title={p.user.name}
            status="PENDING_REVIEW"
            category={p.category}
            location={`Coverage: ${p.coverageDistrict || 'Rwanda'}`}
            tags={p.rateInfo ? [p.rateInfo] : undefined}
            description={p.description}
            imageUrl={getServiceSampleImage(p.category)}
            submitterInfo={`Phone: ${p.user.phone || '—'}`}
            approveLabel="Verify & Approve"
            onApprove={() => handleApprove(p.id)}
            onReject={() => setRejectDialog({ open: true, id: p.id, title: `${p.user.name} (${p.category})` })}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={rejectDialog.open}
        title={`Reject Service Provider: ${rejectDialog.title}`}
        message="State why this service registration cannot be approved at this time."
        confirmLabel="Confirm Rejection"
        cancelLabel={tr('cancel')}
        variant="danger"
        requireComment={true}
        commentLabel="Mandatory Reason:"
        commentPlaceholder="Explain why (e.g. unverified phone number, incomplete credentials, invalid coverage area)..."
        minCommentLength={3}
        isLoading={actionLoading}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectDialog({ open: false, id: '', title: '' })}
      />
    </DashboardLayout>
  );
}
