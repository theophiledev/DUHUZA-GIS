import { useEffect, useState } from 'react';
import { approveMarket, pendingMarket, rejectMarket } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, formatPrice, LoadingSpinner } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { MarketItem } from '../../types';

export function ManagerMarketPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
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
      await rejectMarket(rejectId, rejectComment);
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
      title={`${tr('market')} — ${tr('pendingQueue')}`}
      subtitle="Moderate self-serve marketplace items (electronics, furniture, produce, vehicles) submitted by clients."
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="All Isoko marketplace listings have been reviewed!" />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 uppercase">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{item.title}</h3>
                <p className="text-xs text-gray-500">
                  📍 {item.district || 'Rwanda'}, {item.sector || ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-amber-800">
                  {formatPrice(item.price, item.currency)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
              {item.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => {
                  setRejectId(item.id);
                  setRejectComment('');
                }}
                disabled={actionLoading}
              >
                {tr('reject')}
              </Button>
              <Button
                variant="primary"
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => handleApprove(item.id)}
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
            <h3 className="text-lg font-bold text-gray-900">Rejection Feedback for Market Item</h3>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="State reason for rejection..."
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
