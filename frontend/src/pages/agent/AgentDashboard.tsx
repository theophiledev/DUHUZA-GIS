import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myAssignedGis, myListings, submitListing, updateGisProgress } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  Button,
  Card,
  EmptyState,
  ErrorAlert,
  formatPrice,
  LoadingSpinner,
  StatusBadge,
} from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest, InternalListing } from '../../types';
import {
  Home,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  PlusCircle,
  Edit3,
  Send,
  ExternalLink,
} from 'lucide-react';

export function AgentDashboard() {
  const { tr } = useLanguage();
  const [listings, setListings] = useState<InternalListing[]>([]);
  const [gisTasks, setGisTasks] = useState<GisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [listingsRes, gisRes] = await Promise.allSettled([myListings(), myAssignedGis()]);
      if (listingsRes.status === 'fulfilled') setListings(listingsRes.value);
      if (gisRes.status === 'fulfilled') setGisTasks(gisRes.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitListing = async (id: string) => {
    setActionLoading(true);
    try {
      await submitListing(id);
      showToast('Listing submitted for manager review!', 'success');
      loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGis = async (id: string, status: 'IN_PROGRESS' | 'COMPLETED', reportUrl?: string) => {
    setActionLoading(true);
    try {
      await updateGisProgress(id, { status, ...(reportUrl ? { reportUrl } : {}) });
      showToast('GIS mission status updated!', 'success');
      loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const publishedCount = listings.filter((l) => l.status === 'PUBLISHED').length;
  const pendingCount = listings.filter((l) => l.status === 'PENDING_REVIEW').length;
  const draftCount = listings.filter((l) => l.status === 'DRAFT').length;
  const rejectedListings = listings.filter((l) => l.status === 'REJECTED');
  const activeGisMissions = gisTasks.filter((g) => ['ASSIGNED', 'IN_PROGRESS'].includes(g.status));

  return (
    <DashboardLayout
      title={tr('agentDashboard')}
      subtitle="Property portfolio management, manager review lifecycle, and assigned cadastral GIS survey missions."
      actions={
        <Link to="/dashboard/agent/listings/new">
          <Button variant="primary" className="flex items-center gap-1.5 font-bold shadow-md">
            <PlusCircle className="h-4 w-4" />
            <span>{tr('createListing')}</span>
          </Button>
        </Link>
      }
    >
      {error && <ErrorAlert message={error} onRetry={loadData} />}

      {/* Agent KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Listings */}
        <Card statusRail="approved" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('totalListings')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
              <Home className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-gray-900">{listings.length}</span>
            <span className="text-xs text-gray-500">properties registered</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="text-emerald-700 font-semibold">{publishedCount} {tr('published')}</span>
            <span>·</span>
            <span className="text-amber-700 font-semibold">{pendingCount} {tr('pendingReview')}</span>
            <span>·</span>
            <span className="text-gray-600">{draftCount} {tr('draft')}</span>
          </div>
        </Card>

        {/* Active Published */}
        <Card statusRail="published" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('activeListings')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-emerald-800">{publishedCount}</span>
            <span className="text-xs font-semibold text-emerald-600">live on market</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>Direct WhatsApp Inquiries</span>
            <span className="font-bold text-emerald-700">100% Verified</span>
          </div>
        </Card>

        {/* Action Required / Rejections */}
        <Card
          statusRail={rejectedListings.length > 0 ? 'rejected' : 'neutral'}
          className={`p-5 shadow-xs transition hover:shadow-md ${
            rejectedListings.length > 0 ? 'bg-red-50/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('actionRequired')}</span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                rejectedListings.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`font-heading text-3xl font-extrabold ${
                rejectedListings.length > 0 ? 'text-red-700' : 'text-gray-900'
              }`}
            >
              {rejectedListings.length}
            </span>
            <span className="text-xs text-gray-500">revision requests</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs">
            {rejectedListings.length > 0 ? (
              <span className="font-bold text-red-700">Needs update & resubmission</span>
            ) : (
              <span className="text-emerald-700 font-medium">✓ No revision requests</span>
            )}
          </div>
        </Card>

        {/* Assigned GIS Field Missions */}
        <Card statusRail="assigned" className="p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('assignedGis')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <MapPin className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-blue-900">{activeGisMissions.length}</span>
            <span className="text-xs text-gray-500">active field surveys</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs flex justify-between">
            <span className="text-gray-500">Total Assigned: {gisTasks.length}</span>
            <Link to="/dashboard/agent/gis" className="font-bold text-[#0F766E] hover:underline">
              View Tasks →
            </Link>
          </div>
        </Card>
      </div>

      {/* ACTION REQUIRED: REJECTED LISTINGS FEED */}
      {rejectedListings.length > 0 && (
        <Card statusRail="rejected" className="bg-red-50/30 p-5 space-y-4 shadow-sm border-red-200">
          <div className="flex items-center gap-2.5 text-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <h3 className="font-heading font-bold text-base">Manager Review Notes — Action Required</h3>
              <p className="text-xs text-red-700">
                The manager reviewed these listings and requested modifications before publication.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rejectedListings.map((l) => {
              const latestComment =
                l.statusHistory?.[0]?.comment || 'Please update property details as per manager request.';

              return (
                <div
                  key={l.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`}
                      </span>
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      Category: {l.category} · Price: {formatPrice(l.price, l.currency)}
                    </p>
                    <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-xs text-red-800 font-medium">
                      <strong>Manager Note:</strong> {latestComment}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/dashboard/agent/listings/${l.id}/edit`}>
                      <Button variant="secondary" className="text-xs flex items-center gap-1">
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Details</span>
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      className="text-xs shadow-xs font-bold flex items-center gap-1"
                      onClick={() => handleSubmitListing(l.id)}
                      disabled={actionLoading}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Resubmit for review</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Two Column Layout: Recent Listings & GIS Surveyor Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Recent Listings */}
        <Card className="p-5 border-[#E2E8E6] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-gray-900">{tr('myListings')}</h3>
              <p className="text-xs text-gray-500">Recent property submissions & drafts</p>
            </div>
            <Link to="/dashboard/agent/listings" className="text-xs font-bold text-[#0F766E] hover:underline">
              View All ({listings.length}) →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label={tr('loading')} />
          ) : listings.length === 0 ? (
            <EmptyState
              message="No listings yet. Create your first one to get started."
              actionLabel={`+ ${tr('createListing')}`}
              onAction={() => (window.location.href = '/dashboard/agent/listings/new')}
            />
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 hover:bg-teal-50/30 transition"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {l.category} · {formatPrice(l.price, l.currency)} · {l.district || 'Rwanda'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={l.status} />
                    {l.status === 'DRAFT' && (
                      <Button
                        variant="secondary"
                        className="text-xs px-2.5 py-1 text-[#0F766E] font-bold"
                        onClick={() => handleSubmitListing(l.id)}
                        disabled={actionLoading}
                      >
                        Submit for review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right Column: GIS Surveyor Missions */}
        <Card className="p-5 border-[#E2E8E6] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-gray-900">{tr('assignedGis')}</h3>
              <p className="text-xs text-gray-500">Cadastral boundary surveys assigned to you</p>
            </div>
            <Link to="/dashboard/agent/gis" className="text-xs font-bold text-[#0F766E] hover:underline">
              Full Task List ({gisTasks.length}) →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label={tr('loading')} />
          ) : gisTasks.length === 0 ? (
            <EmptyState message="Nothing pending — you're caught up." />
          ) : (
            <div className="space-y-3">
              {gisTasks.slice(0, 4).map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-gray-100 p-3.5 space-y-2 hover:bg-teal-50/30 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{g.purpose}</span>
                      <p className="text-xs text-gray-500">
                        Client: <span className="font-semibold text-gray-700">{g.client?.name}</span> ({g.client?.phone || '—'})
                      </p>
                    </div>
                    <StatusBadge status={g.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="font-mono-data text-emerald-800 font-bold">
                      <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{g.parcelLat}, {g.parcelLng}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {g.status === 'ASSIGNED' && (
                        <Button
                          variant="secondary"
                          className="text-[11px] px-2.5 py-1 bg-teal-50 text-[#0F766E] border-teal-200 font-bold"
                          onClick={() => handleUpdateGis(g.id, 'IN_PROGRESS')}
                          disabled={actionLoading}
                        >
                          Start Field Work
                        </Button>
                      )}
                      {g.status === 'IN_PROGRESS' && (
                        <Button
                          variant="primary"
                          className="text-[11px] px-2.5 py-1 font-bold"
                          onClick={() => {
                            const url = prompt(tr('reportUrl'), '/images/gis_sample_report_preview.jpg');
                            if (url) handleUpdateGis(g.id, 'COMPLETED', url);
                          }}
                          disabled={actionLoading}
                        >
                          Complete & Attach Report
                        </Button>
                      )}
                      {g.reportUrl && (
                        <a
                          href={g.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[#0F766E] underline text-[11px] flex items-center gap-0.5"
                        >
                          <span>Report</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
