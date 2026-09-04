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
import { ManagerItemDetailModal, type ManagerItemDetailData } from '../../components/ManagerItemDetailModal';
import type { MarketItem } from '../../types';

export function ManagerMarketPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<MarketItem[]>([]);
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
    pendingMarket()
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
      await approveMarket(approveDialog.id, comment);
      showToast('Marketplace item approved and listed live!', 'success');
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
            submitterInfo={
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                  {item.seller?.name ? item.seller.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                    <span>{item.seller?.name || 'Seller'}</span>
                    <span className="rounded bg-amber-50 px-1 py-0.2 text-[10px] font-bold text-amber-800">SELLER</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono-data">
                    {item.seller?.phone || item.seller?.email || '—'}
                  </div>
                </div>
              </div>
            }
            onInspect={() =>
              setDetailModalItem({
                id: item.id,
                type: 'market',
                typeLabel: 'Isoko Marketplace Item',
                title: item.title,
                status: item.status,
                category: item.category,
                price: item.price,
                currency: item.currency,
                description: item.description,
                district: item.district,
                sector: item.sector,
                createdAt: item.createdAt,
                media: item.media,
                submitter: item.seller,
              })
            }
            onApprove={() => handleApprove(item.id, item.title)}
            onReject={() => setRejectDialog({ open: true, id: item.id, title: item.title })}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={approveDialog.open}
        title={`Approve Market Item: ${approveDialog.title}`}
        message="This item will be listed live in the marketplace immediately. You can optionally add feedback about the product quality or documentation."
        confirmLabel="✓ Approve & List"
        cancelLabel={tr('cancel')}
        variant="primary"
        requireComment={false}
        commentLabel="Optional Approval Feedback (visible to public):"
        commentPlaceholder="E.g., Great condition, well-documented, accurately priced..."
        isLoading={actionLoading}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveDialog({ open: false, id: '', title: '' })}
      />

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

      {/* Full Detail Inspection Modal */}
      <ManagerItemDetailModal
        isOpen={Boolean(detailModalItem)}
        item={detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onApprove={async (id, comment) => {
          setActionLoading(true);
          try {
            await approveMarket(id, comment);
            showToast('Market item approved and published live!', 'success');
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
            await rejectMarket(id, comment);
            showToast('Market item rejected with feedback logged.', 'info');
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
