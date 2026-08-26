import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { myListings, submitListing } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  Button,
  Card,
  EmptyState,
  ErrorAlert,
  formatPrice,
  StatusBadge,
} from '../../components/ui';
import { SmartImage } from '../../components/SmartImage';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../../components/SkeletonLoaders';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { InternalListing } from '../../types';
import { PlusCircle, Edit3, Send, ExternalLink, AlertTriangle, MapPin } from 'lucide-react';

export function AgentListingsPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [listings, setListings] = useState<InternalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const load = () => {
    setLoading(true);
    setError('');
    myListings()
      .then((data) => {
        setListings(data);
        setCurrentPage(1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (id: string) => {
    setActionLoading(true);
    try {
      await submitListing(id);
      showToast('Listing submitted for review!', 'success');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    if (selectedStatus === 'ALL') return listings;
    return listings.filter((l) => l.status === selectedStatus);
  }, [listings, selectedStatus]);

  const counts = useMemo(() => {
    return {
      all: listings.length,
      published: listings.filter((l) => l.status === 'PUBLISHED').length,
      pending: listings.filter((l) => l.status === 'PENDING_REVIEW').length,
      draft: listings.filter((l) => l.status === 'DRAFT').length,
      rejected: listings.filter((l) => l.status === 'REJECTED').length,
    };
  }, [listings]);

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, currentPage, pageSize]);

  return (
    <DashboardLayout
      title={tr('myListings')}
      subtitle="Manage your property listings portfolio, review approval states, and resubmit rejected drafts."
      actions={
        <Link to="/dashboard/agent/listings/new">
          <Button variant="primary" className="flex items-center gap-1.5 font-bold shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>{tr('createListing')}</span>
          </Button>
        </Link>
      }
    >
      {/* Filter Tabs */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {[
            { id: 'ALL', label: tr('filterAll'), count: counts.all },
            { id: 'PUBLISHED', label: tr('published'), count: counts.published },
            { id: 'PENDING_REVIEW', label: tr('pendingReview'), count: counts.pending },
            { id: 'DRAFT', label: tr('draft'), count: counts.draft },
            { id: 'REJECTED', label: tr('rejected'), count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.id);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
                selectedStatus === tab.id
                  ? 'bg-[#0F766E] text-white font-bold shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {loading && <TableSkeleton rows={4} cols={4} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && filteredListings.length === 0 && (
        <EmptyState
          message="No listings yet. Create your first one to get started."
          actionLabel={`+ ${tr('createListing')}`}
          onAction={() => navigate('/dashboard/agent/listings/new')}
        />
      )}

      {!loading && filteredListings.length > 0 && (
        <div className="space-y-4">
          {paginatedListings.map((l) => {
            const title = l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`;
            const desc = l.translations?.[0]?.description || '';
            const photos = l.media || [];
            const isRejected = l.status === 'REJECTED';
            const rejectionNote = l.statusHistory?.[0]?.comment;
            const normStatus = l.status.toLowerCase().replace(/_/g, '-');

            return (
              <Card
                key={l.id}
                statusRail={normStatus as any}
                className="overflow-hidden p-0 border-[#E2E8E6] shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo Preview */}
                  {photos.length > 0 && (
                    <div className="md:w-56 bg-gray-100 shrink-0 overflow-hidden">
                      <SmartImage
                        src={photos[0].url}
                        alt={title}
                        fallbackType="property"
                        className="h-44 md:h-full w-full object-cover"
                        containerClassName="h-44 md:h-full w-full"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-teal-50 text-[#0F766E] px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                            {l.category} · {l.listingType}
                          </span>
                          <StatusBadge status={l.status} />
                        </div>
                        <h3 className="font-heading text-base font-bold text-gray-900 mt-1">{title}</h3>
                        <p className="text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{l.district || 'Rwanda'}, {l.sector || ''} {l.cell || ''}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-heading text-lg font-extrabold text-[#0F766E]">
                          {formatPrice(l.price, l.currency)}
                        </div>
                      </div>
                    </div>

                    {desc && <p className="text-xs text-gray-600 line-clamp-2">{desc}</p>}

                    {/* Rejection Note Alert Banner */}
                    {isRejected && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-red-950">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                          <span>Manager Feedback:</span>
                        </div>
                        <p className="leading-relaxed">
                          {rejectionNote || 'Please review your listing specifications, photo URLs, or pricing and resubmit.'}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-400">
                        Owner: {l.ownerName ? `${l.ownerName} (${l.ownerPhone || '—'})` : 'Confidential'}
                      </span>

                      <div className="flex items-center gap-2">
                        {['DRAFT', 'REJECTED'].includes(l.status) && (
                          <>
                            <Link to={`/dashboard/agent/listings/${l.id}/edit`}>
                              <Button variant="secondary" className="text-xs flex items-center gap-1">
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit Details</span>
                              </Button>
                            </Link>
                            <Button
                              variant="primary"
                              className="text-xs font-bold shadow-xs flex items-center gap-1"
                              onClick={() => handleSubmit(l.id)}
                              disabled={actionLoading}
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>{tr('submitForReview')}</span>
                            </Button>
                          </>
                        )}

                        {l.status === 'PUBLISHED' && (
                          <Link
                            to={`/listings/${l.id}`}
                            target="_blank"
                            className="font-bold text-[#0F766E] hover:underline flex items-center gap-1"
                          >
                            <span>View Public Page</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <Pagination
            currentPage={currentPage}
            totalItems={filteredListings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24]}
            itemLabel="listings"
            scrollToTop={false}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
