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
import { ManagerItemDetailModal, type ManagerItemDetailData } from '../../components/ManagerItemDetailModal';
import type { ServiceProvider } from '../../types';

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
  const [items, setItems] = useState<ServiceProvider[]>([]);
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
    pendingServices()
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
      await approveService(approveDialog.id, comment);
      showToast('Service provider verified and approved successfully!', 'success');
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
            title={p.user?.name || 'Service Provider'}
            status="PENDING_REVIEW"
            category={p.category}
            location={`Coverage: ${p.coverageDistrict || 'Rwanda'}`}
            tags={p.rateInfo ? [p.rateInfo] : undefined}
            description={p.description}
            imageUrl={getServiceSampleImage(p.category)}
            submitterInfo={
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-800 font-bold text-xs">
                  {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                    <span>{p.user?.name || 'Provider'}</span>
                    <span className="rounded bg-purple-50 px-1 py-0.2 text-[10px] font-bold text-purple-800">PROVIDER</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono-data">
                    {p.user?.phone || p.user?.email || '—'}
                  </div>
                </div>
              </div>
            }
            approveLabel="Verify & Approve"
            onInspect={() =>
              setDetailModalItem({
                id: p.id,
                type: 'service',
                typeLabel: 'Service Provider Profile',
                title: p.user?.name ? `${p.user.name} (${p.category})` : p.category,
                status: p.status,
                category: p.category,
                description: p.description,
                rateInfo: p.rateInfo,
                coverageDistrict: p.coverageDistrict,
                coverageSector: p.coverageSector,
                createdAt: p.createdAt,
                submitter: p.user,
              })
            }
            onApprove={() => handleApprove(p.id, `${p.user?.name || 'Provider'} (${p.category})`)}
            onReject={() => setRejectDialog({ open: true, id: p.id, title: `${p.user?.name || 'Provider'} (${p.category})` })}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={approveDialog.open}
        title={`Verify Service Provider: ${approveDialog.title}`}
        message="This service provider will be verified and able to accept client requests. You can optionally add comments about their qualifications or verification status."
        confirmLabel="✓ Verify & Approve"
        cancelLabel={tr('cancel')}
        variant="primary"
        requireComment={false}
        commentLabel="Optional Approval Notes (visible to public):"
        commentPlaceholder="E.g., Credentials verified, excellent references, professional qualifications..."
        isLoading={actionLoading}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveDialog({ open: false, id: '', title: '' })}
      />

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

      {/* Full Detail Inspection Modal */}
      <ManagerItemDetailModal
        isOpen={Boolean(detailModalItem)}
        item={detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onApprove={async (id, comment) => {
          setActionLoading(true);
          try {
            await approveService(id, comment);
            showToast('Service provider profile verified and approved!', 'success');
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
            await rejectService(id, comment);
            showToast('Service provider registration rejected.', 'info');
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
