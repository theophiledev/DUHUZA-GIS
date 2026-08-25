import { useEffect, useState, useMemo } from 'react';
import { approveListing, pendingListings, rejectListing } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, formatPrice, StatusBadge } from '../../components/ui';
import { SmartImage } from '../../components/SmartImage';
import { ImageLightbox } from '../../components/ImageLightbox';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../../components/SkeletonLoaders';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { InternalListing } from '../../types';

export function ManagerListingsPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<InternalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Lightbox
  const [lightboxImages, setLightboxImages] = useState<{ url: string; title?: string }[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const load = () => {
    setLoading(true);
    setError('');
    pendingListings()
      .then((data) => {
        setItems(data);
        setCurrentPage(1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await approveListing(id);
      showToast('Listing approved and published successfully!', 'success');
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
      await rejectListing(rejectId, rejectComment);
      showToast('Listing rejected and feedback logged for agent.', 'info');
      setRejectId(null);
      setRejectComment('');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const openGallery = (photos: { url: string }[], title: string) => {
    if (photos.length === 0) return;
    setLightboxImages(photos.map((p) => ({ url: p.url, title })));
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  return (
    <DashboardLayout
      title={`${tr('listings')} — ${tr('pendingQueue')}`}
      subtitle="Review property specifications, inspect high-res photos, verify private owner records, and moderate submissions."
    >
      {error && <ErrorAlert message={error} onRetry={load} />}
      {loading && <TableSkeleton rows={4} cols={4} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState message="No property listings pending review. The queue is up to date." />
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {paginatedItems.map((l) => {
            const title = l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`;
            const desc = l.translations?.[0]?.description || '';
            const photos = l.media || [];

            return (
              <Card key={l.id} className="overflow-hidden p-0 border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row">
                  {/* Media Preview Column */}
                  {photos.length > 0 && (
                    <div
                      onClick={() => openGallery(photos, title)}
                      className="group relative md:w-64 bg-gray-100 shrink-0 cursor-pointer overflow-hidden"
                    >
                      <SmartImage
                        src={photos[0].url}
                        alt={title}
                        fallbackType="property"
                        className="h-48 md:h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        containerClassName="h-48 md:h-full w-full"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        🔍 View Gallery ({photos.length})
                      </div>
                    </div>
                  )}

                  {/* Content Column */}
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-brand-100 text-brand-800 px-2 py-0.5 text-xs font-bold uppercase">
                            {l.category} · {l.listingType}
                          </span>
                          <StatusBadge status={l.status} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">{title}</h3>
                        <p className="text-xs text-gray-500">
                          📍 {l.district || 'Rwanda'} · {l.sector || ''} · {l.cell || ''} · {l.village || ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-extrabold text-brand-700">
                          {formatPrice(l.price, l.currency)}
                        </div>
                      </div>
                    </div>

                    {desc && <p className="text-xs text-gray-600 line-clamp-2">{desc}</p>}

                    {/* Private Owner & Agent Info */}
                    <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-amber-50/70 border border-amber-200/60 p-3 text-xs text-amber-950">
                      <div>
                        <span className="font-bold">🔒 Private Owner:</span> {l.ownerName || '—'}
                        <div>Owner Phone: <span className="font-mono">{l.ownerPhone || '—'}</span></div>
                      </div>
                      <div>
                        <span className="font-bold">Agent:</span> <span className="font-mono">{l.agentId.slice(0, 8)}...</span>
                        {l.internalNotes && <div>Internal Note: <em>{l.internalNotes}</em></div>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="secondary"
                        className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => {
                          setRejectId(l.id);
                          setRejectComment('');
                        }}
                        disabled={actionLoading}
                      >
                        {tr('reject')}
                      </Button>
                      <Button
                        variant="primary"
                        className="text-xs shadow-sm"
                        onClick={() => handleApprove(l.id)}
                        disabled={actionLoading}
                      >
                        ✓ {tr('approve')} & Publish
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <Pagination
            currentPage={currentPage}
            totalItems={items.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24]}
            itemLabel="pending listings"
            scrollToTop={false}
          />
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Provide Rejection Feedback</h3>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Explain why this listing is rejected so the agent can fix and resubmit..."
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

      {/* Lightbox Gallery */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={setLightboxIndex}
      />
    </DashboardLayout>
  );
}
