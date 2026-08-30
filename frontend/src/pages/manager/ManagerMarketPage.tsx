import { useEffect, useState } from 'react';
import { approveMarket, pendingMarket, rejectMarket } from '../../api';
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
import type { MarketItem } from '../../types';

export function ManagerMarketPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<MarketItem[]>([]);
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
    pendingMarket()
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
      await approveMarket(id);
      showToast('Marketplace item approved and listed live!', 'success');
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
      await rejectMarket(rejectDialog.id, comment);
      showToast('Market item rejected with feedback logged.', 'info');
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
      title={`${tr('market')} — ${tr('pendingQueue')}`}
      subtitle="Moderate self-serve marketplace items (electronics, furniture, produce, vehicles) submitted by clients."
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="Nothing pending — you're caught up." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ReviewCard
            key={item.id}
            id={item.id}
            title={item.title}
            status={item.status}
            category={item.category}
            location={`${item.district || 'Rwanda'}, ${item.sector || ''}`}
            price={item.price}
            currency={item.currency}
            description={item.description}
            imageUrl={item.media?.[0]?.url}
            submitterInfo={`Seller: ${item.seller?.name || '—'} (${item.seller?.phone || '—'})`}
            onApprove={() => handleApprove(item.id)}
            onReject={() => setRejectDialog({ open: true, id: item.id, title: item.title })}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={rejectDialog.open}
        title={`Reject Market Item: ${rejectDialog.title}`}
        message="Provide a clear reason for rejecting this item so the seller knows how to rectify their submission."
        confirmLabel="Confirm Rejection"
        cancelLabel={tr('cancel')}
        variant="danger"
        requireComment={true}
        commentLabel="Mandatory Rejection Reason:"
        commentPlaceholder="Explain what needs fixing (e.g. missing price, prohibited item, misleading title)..."
        minCommentLength={3}
        isLoading={actionLoading}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectDialog({ open: false, id: '', title: '' })}
      />
    </DashboardLayout>
  );
}
