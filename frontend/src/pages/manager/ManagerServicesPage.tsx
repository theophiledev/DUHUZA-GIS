import { useEffect, useState } from 'react';
import { approveService, pendingServices, rejectService } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';

export function ManagerServicesPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<{ id: string; category: string; description: string; rateInfo?: string | null; coverageDistrict?: string | null; user: { name: string; phone?: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
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
      await rejectService(rejectId, rejectComment);
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
      title={`${tr('services')} — ${tr('pendingQueue')}`}
      subtitle="Verify tradespeople and professional service providers (plumbing, transport, tutoring, tailoring, etc.)."
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No pending service provider profiles to review." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((p) => (
          <Card key={p.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded bg-purple-100 text-purple-900 text-xs font-bold px-2 py-0.5 capitalize">
                  {p.category}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{p.user.name}</h3>
                <p className="text-xs text-gray-500">
                  📞 {p.user.phone || '—'} · Coverage: {p.coverageDistrict || 'Rwanda'}
                </p>
              </div>
              {p.rateInfo && (
                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {p.rateInfo}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
              {p.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => {
                  setRejectId(p.id);
                  setRejectComment('');
                }}
                disabled={actionLoading}
              >
                {tr('reject')}
              </Button>
              <Button
                variant="primary"
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleApprove(p.id)}
                disabled={actionLoading}
              >
                ✓ Verify & Approve
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Service Profile Rejection Note</h3>
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
