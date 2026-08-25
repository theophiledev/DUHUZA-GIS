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
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest, InternalListing } from '../../types';

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
          <Button variant="primary" className="shadow-lg hover:shadow-xl">
            ➕ {tr('createListing')}
          </Button>
        </Link>
      }
    >
      {error && <ErrorAlert message={error} onRetry={loadData} />}

      {/* Agent KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Listings */}
        <Card className="border-l-4 border-l-brand-600 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('totalListings')}</span>
            <span className="rounded-lg bg-brand-100 p-2 text-xl text-brand-700">🏠</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{listings.length}</span>
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
        <Card className="border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('activeListings')}</span>
            <span className="rounded-lg bg-emerald-100 p-2 text-xl text-emerald-700">✓</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-800">{publishedCount}</span>
            <span className="text-xs font-semibold text-emerald-600">live on market</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>WhatsApp Lead Capture Active</span>
            <span className="font-bold text-emerald-700">100% Verified</span>
          </div>
        </Card>

        {/* Action Required / Rejections */}
        <Card
          className={`border-l-4 p-5 shadow-sm transition hover:shadow-md ${
            rejectedListings.length > 0
              ? 'border-l-red-500 bg-red-50/40 ring-1 ring-red-200'
              : 'border-l-gray-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('actionRequired')}</span>
            <span
              className={`rounded-lg p-2 text-xl ${
                rejectedListings.length > 0 ? 'bg-red-100 text-red-700 animate-bounce' : 'bg-gray-100 text-gray-500'
              }`}
            >
              ⚠️
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold ${
                rejectedListings.length > 0 ? 'text-red-700' : 'text-gray-900'
              }`}
            >
              {rejectedListings.length}
            </span>
            <span className="text-xs text-gray-500">rejected by manager</span>
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
        <Card className="border-l-4 border-l-indigo-600 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('assignedGis')}</span>
            <span className="rounded-lg bg-indigo-100 p-2 text-xl text-indigo-700">🗺️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-800">{activeGisMissions.length}</span>
            <span className="text-xs text-gray-500">active field surveys</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs flex justify-between">
            <span className="text-gray-500">Total Assigned: {gisTasks.length}</span>
            <Link to="/dashboard/agent/gis" className="font-bold text-indigo-700 hover:underline">
              View Tasks →
            </Link>
          </div>
        </Card>
      </div>

      {/* ACTION REQUIRED: REJECTED LISTINGS FEED */}
      {rejectedListings.length > 0 && (
        <Card className="border border-red-200 bg-gradient-to-br from-red-50/60 to-amber-50/40 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-900">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-base">Manager Review Notes — Action Required</h3>
              <p className="text-xs text-red-700">
                The manager reviewed these listings and requested modifications before publication.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rejectedListings.map((l) => {
              const latestComment = l.statusHistory?.[0]?.comment || 'Please update property details as per manager request.';

              return (
                <div
                  key={l.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-4 shadow-sm"
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
                      <Button variant="secondary" className="text-xs">
                        ✏️ Edit Details
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      className="text-xs shadow-sm bg-red-600 hover:bg-red-700"
                      onClick={() => handleSubmitListing(l.id)}
                      disabled={actionLoading}
                    >
                      🚀 Resubmit for Review
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
        <Card className="p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900">{tr('myListings')}</h3>
              <p className="text-xs text-gray-500">Recent property submissions & drafts</p>
            </div>
            <Link to="/dashboard/agent/listings" className="text-xs font-bold text-brand-700 hover:underline">
              View All ({listings.length}) →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label={tr('loading')} />
          ) : listings.length === 0 ? (
            <EmptyState message="You have not created any listings yet." />
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50/80 transition"
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
                        className="text-xs px-2.5 py-1 text-brand-700"
                        onClick={() => handleSubmitListing(l.id)}
                        disabled={actionLoading}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right Column: GIS Surveyor Missions */}
        <Card className="p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900">{tr('assignedGis')}</h3>
              <p className="text-xs text-gray-500">Cadastral boundary surveys assigned to you</p>
            </div>
            <Link to="/dashboard/agent/gis" className="text-xs font-bold text-brand-700 hover:underline">
              Full Task List ({gisTasks.length}) →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label={tr('loading')} />
          ) : gisTasks.length === 0 ? (
            <EmptyState message="No field survey missions currently assigned." />
          ) : (
            <div className="space-y-3">
              {gisTasks.slice(0, 4).map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-gray-100 p-3.5 space-y-2 hover:bg-gray-50/80 transition"
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
                    <span className="font-mono text-emerald-800 font-bold">
                      📍 {g.parcelLat}, {g.parcelLng}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {g.status === 'ASSIGNED' && (
                        <Button
                          variant="secondary"
                          className="text-[11px] px-2.5 py-1 bg-brand-50 text-brand-800 border-brand-200"
                          onClick={() => handleUpdateGis(g.id, 'IN_PROGRESS')}
                          disabled={actionLoading}
                        >
                          Start Field Work
                        </Button>
                      )}
                      {g.status === 'IN_PROGRESS' && (
                        <Button
                          variant="primary"
                          className="text-[11px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700"
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
                          className="font-bold text-brand-700 underline text-[11px]"
                        >
                          📄 Report
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
