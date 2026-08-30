import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  approveJob,
  approveListing,
  approveMarket,
  approveService,
  assignGis,
  listUsers,
  pendingGis,
  pendingJobs,
  pendingListings,
  pendingMarket,
  pendingServices,
  rejectJob,
  rejectListing,
  rejectMarket,
  rejectService,
} from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  ReviewCard,
  StatusBadge,
} from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminUser, GisRequest, InternalListing, Job, MarketItem, ServiceProvider } from '../../types';
import {
  Home,
  MapPin,
  ShoppingBag,
  Wrench,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Search,
  RotateCw,
  Clock,
  ArrowRight,
} from 'lucide-react';

type VerticalTab = 'listings' | 'gis' | 'market' | 'services' | 'jobs';

function getServiceSampleImage(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('electric') || cat.includes('solar')) return '/images/service_electrician.jpg';
  if (cat.includes('paint')) return '/images/service_painting.jpg';
  if (cat.includes('mechanic') || cat.includes('auto')) return '/images/service_mechanic.jpg';
  if (cat.includes('cater') || cat.includes('chef') || cat.includes('event')) return '/images/service_catering.jpg';
  if (cat.includes('plumb')) return '/images/service_plumbing.jpg';
  if (cat.includes('gis') || cat.includes('survey')) return '/images/service_surveyor.jpg';
  return '/images/service_surveyor.jpg';
}

function getJobSampleImage(title: string) {
  const t = (title || '').toLowerCase();
  if (t.includes('survey') || t.includes('field') || t.includes('gis') || t.includes('land')) return '/images/gis_field_surveyor.jpg';
  if (t.includes('developer') || t.includes('tech') || t.includes('engineer')) return '/images/office_commercial_kigali.jpg';
  if (t.includes('marketing') || t.includes('design') || t.includes('content')) return '/images/market_smartphone.jpg';
  if (t.includes('intern') || t.includes('operations') || t.includes('logistics') || t.includes('agri')) return '/images/warehouse_logistics.jpg';
  return '/images/commercial_kigali.jpg';
}

export function ManagerDashboard() {
  const { tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<VerticalTab>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Vertical data
  const [listings, setListings] = useState<InternalListing[]>([]);
  const [gisRequests, setGisRequests] = useState<GisRequest[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [serviceProviders, setServiceProviders] = useState<
    (ServiceProvider & { user: { id: string; name: string; phone?: string } })[]
  >([]);
  const [jobs, setJobs] = useState<(Job & { employer: { id: string; name: string; phone?: string } })[]>([]);
  const [agents, setAgents] = useState<AdminUser[]>([]);

  // Action states
  const [selectedAgentForGis, setSelectedAgentForGis] = useState<Record<string, string>>({});
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    type: VerticalTab;
    id: string;
    title: string;
  }>({ open: false, type: 'listings', id: '', title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [pListings, pGis, pMarket, pServices, pJobs, usersRes] = await Promise.allSettled([
        pendingListings(),
        pendingGis(),
        pendingMarket(),
        pendingServices(),
        pendingJobs(),
        listUsers(),
      ]);

      if (pListings.status === 'fulfilled') setListings(pListings.value);
      if (pGis.status === 'fulfilled') setGisRequests(pGis.value);
      if (pMarket.status === 'fulfilled') setMarketItems(pMarket.value);
      if (pServices.status === 'fulfilled') setServiceProviders(pServices.value);
      if (pJobs.status === 'fulfilled') setJobs(pJobs.value);

      if (usersRes.status === 'fulfilled') {
        setAgents(usersRes.value.filter((u) => u.role === 'AGENT' && u.isActive));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Quick Approval Handlers
  const handleApproveListing = async (id: string) => {
    setActionLoading(true);
    try {
      await approveListing(id);
      showToast('Property listing approved and published!', 'success');
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMarket = async (id: string) => {
    setActionLoading(true);
    try {
      await approveMarket(id);
      showToast('Isoko marketplace item approved!', 'success');
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveService = async (id: string) => {
    setActionLoading(true);
    try {
      await approveService(id);
      showToast('Service provider profile verified and approved!', 'success');
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveJob = async (id: string) => {
    setActionLoading(true);
    try {
      await approveJob(id);
      showToast('Job opening approved and published!', 'success');
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignGis = async (gisId: string) => {
    const agentId = selectedAgentForGis[gisId];
    if (!agentId) {
      alert('Please select a surveyor/agent to assign');
      return;
    }
    setActionLoading(true);
    try {
      await assignGis(gisId, agentId);
      showToast('GIS cadastral mission assigned to surveyor!', 'success');
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Rejection Dialog Handler
  const openRejectDialog = (type: VerticalTab, id: string, title: string) => {
    setRejectDialog({ open: true, type, id, title });
  };

  const handleConfirmReject = async (comment?: string) => {
    if (!comment || comment.trim().length < 3) return;

    setActionLoading(true);
    try {
      if (rejectDialog.type === 'listings') await rejectListing(rejectDialog.id, comment);
      else if (rejectDialog.type === 'market') await rejectMarket(rejectDialog.id, comment);
      else if (rejectDialog.type === 'services') await rejectService(rejectDialog.id, comment);
      else if (rejectDialog.type === 'jobs') await rejectJob(rejectDialog.id, comment);

      showToast('Submission rejected and feedback saved for submitter.', 'info');
      setRejectDialog({ open: false, type: 'listings', id: '', title: '' });
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const totalPending =
    listings.length +
    gisRequests.length +
    marketItems.length +
    serviceProviders.length +
    jobs.length;

  const unassignedGisCount = gisRequests.filter((g) => !g.assignedAgentId).length;

  // Filtered Queues by Search Query
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase();
    return listings.filter((l) => {
      const title = l.translations?.[0]?.title?.toLowerCase() || '';
      const district = l.district?.toLowerCase() || '';
      return title.includes(q) || district.includes(q) || l.id.toLowerCase().includes(q);
    });
  }, [listings, searchQuery]);

  const filteredMarket = useMemo(() => {
    if (!searchQuery.trim()) return marketItems;
    const q = searchQuery.toLowerCase();
    return marketItems.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.district?.toLowerCase().includes(q)
    );
  }, [marketItems, searchQuery]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return serviceProviders;
    const q = searchQuery.toLowerCase();
    return serviceProviders.filter(
      (s) =>
        s.category.toLowerCase().includes(q) ||
        s.user?.name.toLowerCase().includes(q) ||
        s.coverageDistrict?.toLowerCase().includes(q)
    );
  }, [serviceProviders, searchQuery]);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.employer?.name.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const filteredGis = useMemo(() => {
    if (!searchQuery.trim()) return gisRequests;
    const q = searchQuery.toLowerCase();
    return gisRequests.filter(
      (g) =>
        g.purpose.toLowerCase().includes(q) ||
        g.client?.name.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q)
    );
  }, [gisRequests, searchQuery]);

  return (
    <DashboardLayout
      title={tr('managerDashboard')}
      subtitle="Moderation triage hub with live queue dispatch, content verification, and multi-vertical governance."
      actions={
        <Button
          variant="secondary"
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold shadow-xs"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All Queues</span>
        </Button>
      }
    >
      {error && <ErrorAlert message={error} onRetry={loadAll} />}

      {/* 1. Executive Triage Summary Header Bar */}
      <div className="rounded-2xl border border-[#E2E8E6] bg-gradient-to-r from-[#0F766E]/10 via-teal-50/50 to-amber-50/40 p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F766E] text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="font-heading text-lg font-bold text-gray-900">
                Moderation Command Center
              </h2>
            </div>
            <p className="text-xs text-gray-600">
              <strong className="text-brand-800 font-bold">{totalPending} items</strong> currently awaiting manager triage and publication review.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[260px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active queue..."
              className="w-full rounded-xl border border-gray-300 bg-white/90 py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0F766E] focus:bg-white focus:outline-none shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Main Moderation Queue Stream (8 cols) */}
        <div className="space-y-5 lg:col-span-8">
          {/* Vertical Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <button
              type="button"
              onClick={() => setActiveTab('listings')}
              className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                activeTab === 'listings'
                  ? 'border-[#0F766E] bg-teal-50/60 shadow-sm ring-2 ring-[#0F766E]/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <Home className="h-3.5 w-3.5 text-[#0F766E]" />
                  {tr('listings')}
                </span>
                <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-[#0F766E]">
                  {listings.length}
                </span>
              </div>
              <span className="mt-1 font-heading text-lg font-extrabold text-gray-900">
                {listings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gis')}
              className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                activeTab === 'gis'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {tr('gisRequest')}
                </span>
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {gisRequests.length}
                </span>
              </div>
              <span className="mt-1 font-heading text-lg font-extrabold text-gray-900">
                {gisRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('market')}
              className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                activeTab === 'market'
                  ? 'border-amber-600 bg-amber-50/60 shadow-sm ring-2 ring-amber-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
                  {tr('market')}
                </span>
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  {marketItems.length}
                </span>
              </div>
              <span className="mt-1 font-heading text-lg font-extrabold text-gray-900">
                {marketItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                activeTab === 'services'
                  ? 'border-purple-600 bg-purple-50/60 shadow-sm ring-2 ring-purple-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5 text-purple-600" />
                  {tr('services')}
                </span>
                <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                  {serviceProviders.length}
                </span>
              </div>
              <span className="mt-1 font-heading text-lg font-extrabold text-gray-900">
                {serviceProviders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                activeTab === 'jobs'
                  ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                  {tr('jobs')}
                </span>
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                  {jobs.length}
                </span>
              </div>
              <span className="mt-1 font-heading text-lg font-extrabold text-gray-900">
                {jobs.length}
              </span>
            </button>
          </div>

          {/* Queue Stream Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8E6] pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-gray-900">
                {activeTab === 'listings' && `Property Listings Queue (${filteredListings.length})`}
                {activeTab === 'gis' && `GIS Survey Dispatch Queue (${filteredGis.length})`}
                {activeTab === 'market' && `Isoko Marketplace Queue (${filteredMarket.length})`}
                {activeTab === 'services' && `Service Providers Queue (${filteredServices.length})`}
                {activeTab === 'jobs' && `Job Postings Queue (${filteredJobs.length})`}
              </h3>
              {searchQuery && (
                <p className="text-xs text-gray-500">Filtered by &ldquo;{searchQuery}&rdquo;</p>
              )}
            </div>
            <Link
              to={`/dashboard/manager/${activeTab}`}
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1"
            >
              <span>Full Queue View</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label={tr('loading')} />
          ) : (
            <div className="space-y-4">
              {/* TAB 1: PROPERTY LISTINGS */}
              {activeTab === 'listings' && (
                <>
                  {filteredListings.length === 0 ? (
                    <EmptyState message="Nothing pending in property listings — you are all caught up." />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredListings.map((l) => {
                        const title = l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`;
                        const desc = l.translations?.[0]?.description || '';
                        const photo = l.media?.[0]?.url;

                        return (
                          <ReviewCard
                            key={l.id}
                            id={l.id}
                            title={title}
                            status={l.status}
                            category={`${l.category} · ${l.listingType}`}
                            location={`${l.district || 'Rwanda'}, ${l.sector || ''} ${l.cell || ''}`}
                            price={l.price}
                            currency={l.currency}
                            description={desc}
                            imageUrl={photo}
                            ownerName={l.ownerName}
                            ownerPhone={l.ownerPhone}
                            internalNotes={l.internalNotes}
                            submitterInfo={`Agent: ${l.agentId.slice(0, 8)}...`}
                            onApprove={() => handleApproveListing(l.id)}
                            onReject={() => openRejectDialog('listings', l.id, title)}
                            actionLoading={actionLoading}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: GIS SURVEY REQUESTS & DISPATCH */}
              {activeTab === 'gis' && (
                <>
                  {filteredGis.length === 0 ? (
                    <EmptyState message="No pending GIS survey missions." />
                  ) : (
                    <div className="space-y-3">
                      {filteredGis.map((r) => (
                        <Card key={r.id} statusRail="pending" className="p-5 space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={r.status} />
                                <span className="text-xs font-mono-data text-gray-400">ID: {r.id.slice(0, 8)}</span>
                              </div>
                              <h4 className="font-heading font-bold text-gray-900 mt-1.5 text-base">{r.purpose}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Client: <span className="font-semibold text-gray-800">{r.client?.name}</span> ({r.client?.phone || '—'})
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-mono-data font-bold text-emerald-800">
                                <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{r.parcelLat}, {r.parcelLng}</span>
                              </span>
                            </div>
                          </div>

                          {/* Surveyor Assignment Box */}
                          <div className="rounded-xl border border-[#E2E8E6] bg-gray-50/70 p-3.5 space-y-2.5">
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Dispatch Certified Surveyor (Agent)
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <select
                                value={selectedAgentForGis[r.id] || r.assignedAgentId || ''}
                                onChange={(e) =>
                                  setSelectedAgentForGis({ ...selectedAgentForGis, [r.id]: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-[#0F766E] focus:outline-none"
                              >
                                <option value="">-- Select Active Surveyor / Agent --</option>
                                {agents.map((ag) => (
                                  <option key={ag.id} value={ag.id}>
                                    {ag.name} ({ag.phone || ag.email || ag.id.slice(0, 6)})
                                  </option>
                                ))}
                              </select>
                              <Button
                                variant="primary"
                                className="text-xs whitespace-nowrap px-3 py-1.5 font-bold"
                                onClick={() => handleAssignGis(r.id)}
                                disabled={actionLoading}
                              >
                                {r.assignedAgentId ? 'Reassign' : 'Assign Mission'}
                              </Button>
                            </div>
                            {r.assignedAgent && (
                              <div className="text-[11px] text-emerald-800 font-semibold">
                                ✓ Currently assigned to: {r.assignedAgent.name} ({r.assignedAgent.phone || ''})
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB 3: ISOKO / MARKET ITEMS */}
              {activeTab === 'market' && (
                <>
                  {filteredMarket.length === 0 ? (
                    <EmptyState message="Nothing pending in marketplace items." />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredMarket.map((item) => (
                        <ReviewCard
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          status={item.status}
                          category={item.category}
                          price={item.price}
                          currency={item.currency}
                          description={item.description}
                          imageUrl={item.media?.[0]?.url}
                          submitterInfo={`Seller: ${item.seller?.name || '—'} (${item.seller?.phone || '—'})`}
                          onApprove={() => handleApproveMarket(item.id)}
                          onReject={() => openRejectDialog('market', item.id, item.title)}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB 4: SERVICE PROVIDERS */}
              {activeTab === 'services' && (
                <>
                  {filteredServices.length === 0 ? (
                    <EmptyState message="No pending service provider profiles." />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredServices.map((p) => (
                        <ReviewCard
                          key={p.id}
                          id={p.id}
                          title={p.user?.name || 'Service Provider'}
                          status={p.status}
                          category={p.category}
                          location={`Coverage: ${p.coverageDistrict || 'Rwanda'}`}
                          tags={p.rateInfo ? [p.rateInfo] : undefined}
                          description={p.description}
                          imageUrl={getServiceSampleImage(p.category)}
                          submitterInfo={`Phone: ${p.user?.phone || '—'}`}
                          approveLabel="Verify & Approve"
                          onApprove={() => handleApproveService(p.id)}
                          onReject={() => openRejectDialog('services', p.id, `${p.user?.name} (${p.category})`)}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB 5: JOBS */}
              {activeTab === 'jobs' && (
                <>
                  {filteredJobs.length === 0 ? (
                    <EmptyState message="No pending job vacancies to review." />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredJobs.map((job) => (
                        <ReviewCard
                          key={job.id}
                          id={job.id}
                          title={job.title}
                          status={job.status}
                          location={job.location || 'Rwanda'}
                          tags={job.salaryRange ? [job.salaryRange] : undefined}
                          description={job.description}
                          imageUrl={getJobSampleImage(job.title)}
                          submitterInfo={`Employer: ${job.employer?.name || '—'}`}
                          onApprove={() => handleApproveJob(job.id)}
                          onReject={() => openRejectDialog('jobs', job.id, job.title)}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Triage Analytics & Dispatch Sidebar (4 cols) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Backlog Distribution Card */}
          <Card className="p-5 space-y-4 border border-[#E2E8E6] shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-gray-900 text-sm">
                Queue Breakdown
              </h3>
              <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-[#0F766E]">
                {totalPending} Total
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-[#0F766E]" /> Property Listings
                  </span>
                  <span className="font-bold text-gray-900">{listings.length}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#0F766E]"
                    style={{ width: `${totalPending > 0 ? (listings.length / totalPending) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" /> GIS Demarcations
                  </span>
                  <span className="font-bold text-gray-900">{gisRequests.length}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${totalPending > 0 ? (gisRequests.length / totalPending) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-600" /> Isoko Items
                  </span>
                  <span className="font-bold text-gray-900">{marketItems.length}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-amber-600"
                    style={{ width: `${totalPending > 0 ? (marketItems.length / totalPending) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-purple-600" /> Service Providers
                  </span>
                  <span className="font-bold text-gray-900">{serviceProviders.length}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${totalPending > 0 ? (serviceProviders.length / totalPending) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-blue-600" /> Job Postings
                  </span>
                  <span className="font-bold text-gray-900">{jobs.length}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${totalPending > 0 ? (jobs.length / totalPending) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Urgent GIS Dispatch Alert Panel */}
          {unassignedGisCount > 0 && (
            <Card statusRail="pending" className="p-5 space-y-3 bg-amber-50/30 border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Urgent: {unassignedGisCount} Unassigned GIS Surveys</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Field cadastral requests require certified surveyor assignment within 24 hours.
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('gis')}
                className="w-full text-xs font-bold justify-center"
              >
                Dispatch Surveyors Now →
              </Button>
            </Card>
          )}

          {/* Dedicated Management Portals */}
          <Card className="p-5 space-y-3 border border-[#E2E8E6]">
            <h3 className="font-heading font-bold text-gray-900 text-sm">
              Dedicated Management Portals
            </h3>
            <div className="space-y-1.5">
              <Link
                to="/dashboard/manager/listings"
                className="flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-gray-700 hover:bg-teal-50 hover:text-[#0F766E] transition"
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-[#0F766E]" /> Property Management
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/dashboard/manager/gis"
                className="flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> GIS Cadastral Hub
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/dashboard/manager/market"
                className="flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-amber-600" /> Isoko Marketplace
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/dashboard/manager/services"
                className="flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-purple-600" /> Trade Services Hub
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/dashboard/manager/jobs"
                className="flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" /> Jobs & Careers
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Mandatory Rejection Reason Dialog Modal */}
      <ConfirmDialog
        isOpen={rejectDialog.open}
        title={`Reject Submission: ${rejectDialog.title}`}
        message="Please provide specific, actionable feedback for the submitter so they can rectify and resubmit."
        confirmLabel="Confirm Rejection"
        cancelLabel={tr('cancel')}
        variant="danger"
        requireComment={true}
        commentLabel="Mandatory Reason / Feedback (BR6):"
        commentPlaceholder="Explain what needs to be fixed (e.g. missing photo, incorrect price, unverified UPI number)..."
        minCommentLength={3}
        isLoading={actionLoading}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectDialog({ open: false, type: 'listings', id: '', title: '' })}
      />
    </DashboardLayout>
  );
}
