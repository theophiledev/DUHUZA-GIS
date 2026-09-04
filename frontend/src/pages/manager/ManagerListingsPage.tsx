import { useEffect, useState, useMemo } from 'react';
import { approveListing, pendingListings, rejectListing } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  formatPrice,
  StatusBadge,
} from '../../components/ui';
import { SmartImage } from '../../components/SmartImage';
import { ImageLightbox } from '../../components/ImageLightbox';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../../components/SkeletonLoaders';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { ManagerItemDetailModal, type ManagerItemDetailData } from '../../components/ManagerItemDetailModal';
import type { InternalListing } from '../../types';
import { Lock, Search, MapPin, Eye, User } from 'lucide-react';

export function ManagerListingsPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<InternalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [detailModalItem, setDetailModalItem] = useState<ManagerItemDetailData | null>(null);

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

  const handleApprove = async (id: string, title: string) => {
    setApproveDialog({ open: true, id, title });
  };

  const handleApproveConfirm = async (comment?: string) => {
    if (!approveDialog.id) return;
    setActionLoading(true);
    try {
      await approveListing(approveDialog.id, comment);
      showToast('Listing approved and published successfully!', 'success');
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
      await rejectListing(rejectDialog.id, comment);
      showToast('Listing rejected and feedback logged for agent.', 'info');
      setRejectDialog({ open: false, id: '', title: '' });
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
        <EmptyState message="Nothing pending — you're caught up." />
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {paginatedItems.map((l) => {
            const title = l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`;
            const desc = l.translations?.[0]?.description || '';
            const photos = l.media || [];

            return (
              <Card
                key={l.id}
                statusRail="pending"
                className="overflow-hidden p-0 border-[#E2E8E6] shadow-sm hover:shadow-md transition"
              >
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
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-xs">
                        <span className="inline-flex items-center gap-1"><Search size={14} strokeWidth={1.75} />View Gallery ({photos.length})</span>
                      </div>
                    </div>
                  )}

                  {/* Content Column */}
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-teal-50 text-[#0F766E] px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                            {l.category} · {l.listingType}
                          </span>
                          <StatusBadge status={l.status} />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-gray-900 mt-1">{title}</h3>
                        <p className="text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{l.district || 'Rwanda'} · {l.sector || ''} · {l.cell || ''} · {l.village || ''}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-heading text-xl font-extrabold text-[#0F766E]">
                          {formatPrice(l.price, l.currency)}
                        </div>
                      </div>
                    </div>

                    {desc && <p className="text-xs text-gray-600 line-clamp-2">{desc}</p>}

                    {/* Submitter Agent & Private Owner Info Box */}
                    <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-amber-50/70 border border-amber-200/60 p-3.5 text-xs text-amber-950">
                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                          <User className="h-3.5 w-3.5 text-amber-800" />
                          <span>Submitter Agent:</span>
                          <span className="font-semibold text-teal-900">{l.agent?.name || 'Agent'}</span>
                        </div>
                        <div className="text-[11px] text-amber-900">
                          Phone: <span className="font-mono-data font-semibold">{l.agent?.phone || '—'}</span>
                        </div>
                        {l.agent?.email && (
                          <div className="text-[11px] text-amber-900 truncate">
                            Email: <span className="font-semibold">{l.agent.email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                          <Lock className="h-3.5 w-3.5 text-amber-800" />
                          <span>Confidential Owner:</span>
                          <span className="font-semibold text-amber-950">{l.ownerName || '—'}</span>
                        </div>
                        <div className="text-[11px] text-amber-900">
                          Owner Phone: <span className="font-mono-data font-semibold">{l.ownerPhone || '—'}</span>
                        </div>
                        {l.internalNotes && (
                          <div className="text-[11px] text-amber-900 italic truncate">
                            Note: {l.internalNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="secondary"
                        className="text-xs text-[#0F766E] border-teal-200 hover:bg-teal-50"
                        onClick={() =>
                          setDetailModalItem({
                            id: l.id,
                            type: 'listing',
                            typeLabel: 'Property Listing',
                            title,
                            status: l.status,
                            category: l.category,
                            listingType: l.listingType,
                            price: l.price,
                            currency: l.currency,
                            description: desc,
                            district: l.district,
                            sector: l.sector,
                            cell: l.cell,
                            village: l.village,
                            publicLat: l.publicLat,
                            publicLng: l.publicLng,
                            privateLat: l.privateLat,
                            privateLng: l.privateLng,
                            ownerName: l.ownerName,
                            ownerPhone: l.ownerPhone,
                            internalNotes: l.internalNotes,
                            createdAt: l.createdAt,
                            media: l.media,
                            attributes: l.attributes,
                            translations: l.translations,
                            submitter: l.agent,
                          })
                        }
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Inspect Details
                      </Button>
                      <Button
                        variant="secondary"
                        className="text-xs text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => setRejectDialog({ open: true, id: l.id, title })}
                        disabled={actionLoading}
                      >
                        {tr('reject')}
                      </Button>
                      <Button
                        variant="primary"
                        className="text-xs font-bold"
                        onClick={() => handleApprove(l.id, (l.translations?.[0]?.title || 'Listing'))}
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

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={approveDialog.open}
        title={`Approve Property Listing: ${approveDialog.title}`}
        message="This listing will be published immediately and visible to all clients. You can optionally add feedback about what was done well."
        confirmLabel="✓ Approve & Publish"
        cancelLabel={tr('cancel')}
        variant="primary"
        requireComment={false}
        commentLabel="Optional Approval Feedback (visible to public):"
        commentPlaceholder="E.g., Great photos, verified owner info, complete documentation..."
        isLoading={actionLoading}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveDialog({ open: false, id: '', title: '' })}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={rejectDialog.open}
        title={`Reject Property Listing: ${rejectDialog.title}`}
        message="Provide clear feedback on why this listing was not approved so the agent can update and resubmit."
        confirmLabel="Confirm Rejection"
        cancelLabel={tr('cancel')}
        variant="danger"
        requireComment={true}
        commentLabel="Mandatory Rejection Feedback:"
        commentPlaceholder="Explain required corrections (e.g. invalid pricing, unclear photos, wrong location)..."
        minCommentLength={3}
        isLoading={actionLoading}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectDialog({ open: false, id: '', title: '' })}
      />

      {/* Lightbox Gallery */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={setLightboxIndex}
      />

      {/* Full Detail Inspection Modal */}
      <ManagerItemDetailModal
        isOpen={Boolean(detailModalItem)}
        item={detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onApprove={async (id, comment) => {
          setActionLoading(true);
          try {
            await approveListing(id, comment);
            showToast('Listing approved and published successfully!', 'success');
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
            await rejectListing(id, comment);
            showToast('Listing rejected and feedback logged for agent.', 'info');
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
