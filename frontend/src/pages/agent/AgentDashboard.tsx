import { useEffect, useState, useMemo } from 'react';
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
import { SmartImage } from '../../components/SmartImage';
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
  Search,
  Compass,
} from 'lucide-react';

export function AgentDashboard() {
  const { tr } = useLanguage();
  const [listings, setListings] = useState<InternalListing[]>([]);
  const [gisTasks, setGisTasks] = useState<GisRequest[]>([]);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchesTab =
        selectedStatusTab === 'ALL' ||
        (selectedStatusTab === 'PUBLISHED' && l.status === 'PUBLISHED') ||
        (selectedStatusTab === 'PENDING' && l.status === 'PENDING_REVIEW') ||
        (selectedStatusTab === 'DRAFT' && l.status === 'DRAFT') ||
        (selectedStatusTab === 'REJECTED' && l.status === 'REJECTED');

      const q = searchQuery.toLowerCase().trim();
      const title = l.translations?.[0]?.title?.toLowerCase() || '';
      const district = l.district?.toLowerCase() || '';
      const matchesSearch = !q || title.includes(q) || district.includes(q) || l.id.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [listings, selectedStatusTab, searchQuery]);

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

      {/* 1. Agent KPI Portfolio Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Registered */}
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

        {/* Live Published */}
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
            <span>Direct Leads</span>
            <span className="font-bold text-emerald-700">WhatsApp Enabled</span>
          </div>
        </Card>

        {/* Action Required */}
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
              <span className="font-bold text-red-700">Manager feedback waiting</span>
            ) : (
              <span className="text-emerald-700 font-medium">✓ All listings approved/clean</span>
            )}
          </div>
        </Card>

        {/* Assigned GIS Field Surveys */}
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
              Manage Missions →
            </Link>
          </div>
        </Card>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Property Portfolio & Revisions (8 cols) */}
        <div className="space-y-5 lg:col-span-8">
          {/* Action Required: Manager Rejection Feedback Box */}
          {rejectedListings.length > 0 && (
            <Card statusRail="rejected" className="bg-red-50/30 p-5 space-y-4 shadow-sm border-red-200">
              <div className="flex items-center gap-2.5 text-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base">Manager Review Notes — Action Required</h3>
                  <p className="text-xs text-red-700">
                    The manager reviewed these listings and requested revisions before publication.
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
                          <span>Resubmit</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Property Portfolio Stream */}
          <Card className="p-5 border-[#E2E8E6] space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-gray-900 text-base">{tr('myListings')} Portfolio</h3>
                <p className="text-xs text-gray-500">Manage, edit, submit, and track live properties</p>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label: 'All Listings', count: listings.length },
                { key: 'PUBLISHED', label: tr('published'), count: publishedCount },
                { key: 'PENDING', label: tr('pendingReview'), count: pendingCount },
                { key: 'DRAFT', label: tr('draft'), count: draftCount },
                { key: 'REJECTED', label: tr('rejected'), count: rejectedListings.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatusTab(tab.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedStatusTab === tab.key
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 text-[10px] opacity-80">({tab.count})</span>
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingSpinner label={tr('loading')} />
            ) : filteredListings.length === 0 ? (
              <EmptyState message="No properties found matching the selected filter." />
            ) : (
              <div className="space-y-3">
                {filteredListings.map((listing) => {
                  const title = listing.translations?.[0]?.title || `Property #${listing.id.slice(0, 8)}`;
                  const photo = listing.media?.[0]?.url;
                  const locationText = [listing.district, listing.sector].filter(Boolean).join(', ') || 'Rwanda';

                  return (
                    <div
                      key={listing.id}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs hover:border-[#0F766E]/40 hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <SmartImage
                            src={photo}
                            alt={title}
                            fallbackType="property"
                            className="h-full w-full object-cover"
                            containerClassName="h-full w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{title}</span>
                            <StatusBadge status={listing.status} />
                          </div>
                          <p className="text-xs text-gray-500">
                            {listing.category} · {locationText}
                          </p>
                          <p className="font-extrabold text-[#0F766E] text-xs">
                            {formatPrice(listing.price, listing.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {listing.status === 'PUBLISHED' && (
                          <Link
                            to={`/listings/${listing.id}`}
                            target="_blank"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 transition"
                            title="View Live Listing"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <Link to={`/dashboard/agent/listings/${listing.id}/edit`}>
                          <Button variant="secondary" className="text-xs px-2.5 py-1 font-semibold">
                            <Edit3 className="h-3 w-3 mr-1" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                        {listing.status === 'DRAFT' && (
                          <Button
                            variant="primary"
                            className="text-xs px-2.5 py-1 font-bold"
                            onClick={() => handleSubmitListing(listing.id)}
                            disabled={actionLoading}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            <span>Submit</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Assigned GIS Missions & Quick Tools (4 cols) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Assigned Cadastral GIS Surveys */}
          <Card className="p-5 space-y-4 border border-[#E2E8E6]">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-gray-900 text-sm">
                Assigned GIS Missions
              </h3>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                {gisTasks.length} Total
              </span>
            </div>

            {gisTasks.length === 0 ? (
              <EmptyState message="No GIS survey missions assigned yet." />
            ) : (
              <div className="space-y-3">
                {gisTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <StatusBadge status={task.status} />
                      <span className="font-mono-data text-[10px] text-gray-400">ID: {task.id.slice(0, 6)}</span>
                    </div>

                    <p className="font-bold text-gray-900 line-clamp-2">{task.purpose}</p>
                    <p className="text-gray-500">
                      Client: <span className="font-semibold text-gray-700">{task.client?.name || '—'}</span>
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-800 font-mono-data">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} strokeWidth={1.75} /> {task.parcelLat}, {task.parcelLng}
                      </span>
                    </div>

                    {/* Progress Update Actions */}
                    {task.status === 'ASSIGNED' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateGis(task.id, 'IN_PROGRESS')}
                        className="w-full text-xs font-bold justify-center py-1 mt-1"
                        disabled={actionLoading}
                      >
                        Start Field Survey →
                      </Button>
                    )}

                    {task.status === 'IN_PROGRESS' && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          const url = prompt(tr('reportUrl'), '/images/gis_sample_report_preview.jpg');
                          if (url) handleUpdateGis(task.id, 'COMPLETED', url);
                        }}
                        className="w-full text-xs font-bold justify-center py-1 mt-1 bg-emerald-600 hover:bg-emerald-700"
                        disabled={actionLoading}
                      >
                        Upload Survey &amp; Complete ✓
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/dashboard/agent/gis"
              className="mt-2 block w-full rounded-xl bg-teal-50 p-2.5 text-center text-xs font-bold text-[#0F766E] hover:bg-teal-100 transition"
            >
              Open Full GIS Survey Workspace →
            </Link>
          </Card>

          {/* Quick Agent Actions */}
          <Card className="p-5 space-y-3 border border-[#E2E8E6]">
            <h3 className="font-heading font-bold text-gray-900 text-sm">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link to="/dashboard/agent/listings/new">
                <Button variant="primary" className="w-full justify-center text-xs font-bold shadow-xs">
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>Register New Property</span>
                </Button>
              </Link>
              <Link to="/gis">
                <Button variant="secondary" className="w-full justify-center text-xs font-bold">
                  <Compass className="h-3.5 w-3.5 mr-1.5 text-emerald-700" />
                  <span>Public GIS Cadastral Map</span>
                </Button>
              </Link>
              <Link to="/listings">
                <Button variant="secondary" className="w-full justify-center text-xs font-bold">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  <span>Browse Live Marketplace</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
