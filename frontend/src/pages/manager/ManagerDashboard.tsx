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
import { ManagerItemDetailModal, type ManagerItemDetailData } from '../../components/ManagerItemDetailModal';
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
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

type VerticalTab = 'listings' | 'gis' | 'market' | 'services' | 'jobs' | 'comments';

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

  // Approval comments aggregated from all verticals
  const approvalComments = useMemo(() => {
    const items: {
      id: string;
      type: string;
      title: string;
      comment: string;
      status: string;
    }[] = [];
    listings.forEach(() => {
      // comments in status history aren't loaded here; show published items with comments via right column link
    });
    marketItems.forEach((m) => {
      if (m.approvalComment) items.push({ id: m.id, type: 'Market Item', title: m.title, comment: m.approvalComment, status: m.status });
    });
    serviceProviders.forEach((s) => {
      if (s.approvalComment) items.push({ id: s.id, type: 'Service', title: s.category, comment: s.approvalComment, status: s.status });
    });
    jobs.forEach((j) => {
      if (j.approvalComment) items.push({ id: j.id, type: 'Job', title: j.title, comment: j.approvalComment, status: j.status });
    });
    return items;
  }, [listings, marketItems, serviceProviders, jobs]);

  // Action states
  const [selectedAgentForGis, setSelectedAgentForGis] = useState<Record<string, string>>({});
  const [detailModalItem, setDetailModalItem] = useState<ManagerItemDetailData | null>(null);
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

  // Detailed Modal Inspection Mappers
  const openListingDetail = (l: InternalListing) => {
    setDetailModalItem({
      id: l.id,
      type: 'listing',
      typeLabel: 'Property Listing',
      title: l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`,
      status: l.status,
      category: l.category,
      listingType: l.listingType,
      price: l.price,
      currency: l.currency,
      description: l.translations?.[0]?.description,
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
    });
  };

  const openMarketDetail = (m: MarketItem) => {
    setDetailModalItem({
      id: m.id,
      type: 'market',
      typeLabel: 'Isoko Marketplace Item',
      title: m.title,
      status: m.status,
      category: m.category,
      price: m.price,
      currency: m.currency,
      description: m.description,
      district: m.district,
      sector: m.sector,
      createdAt: m.createdAt,
      media: m.media,
      submitter: m.seller,
    });
  };

  const openServiceDetail = (s: ServiceProvider) => {
    setDetailModalItem({
      id: s.id,
      type: 'service',
      typeLabel: 'Service Provider Profile',
      title: s.user?.name ? `${s.user.name} (${s.category})` : s.category,
      status: s.status,
      category: s.category,
      description: s.description,
      rateInfo: s.rateInfo,
      coverageDistrict: s.coverageDistrict,
      coverageSector: s.coverageSector,
      createdAt: s.createdAt,
      submitter: s.user,
    });
  };

  const openJobDetail = (j: Job) => {
    setDetailModalItem({
      id: j.id,
      type: 'job',
      typeLabel: 'Job Vacancy',
      title: j.title,
      status: j.status,
      location: j.location,
      salaryRange: j.salaryRange,
      deadline: j.deadline,
      description: j.description,
      createdAt: j.createdAt,
      submitter: j.employer,
    });
  };

  const openGisDetail = (g: GisRequest) => {
    setDetailModalItem({
      id: g.id,
      type: 'gis',
      typeLabel: 'GIS Cadastral Survey Mission',
      title: g.purpose,
      status: g.status,
      publicLat: g.parcelLat,
      publicLng: g.parcelLng,
      createdAt: g.createdAt,
      submitter: g.client,
      assignedAgent: g.assignedAgent,
      reportUrl: g.reportUrl,
    });
  };

  const handleDetailApprove = async (id: string, comment?: string) => {
    if (!detailModalItem) return;
    setActionLoading(true);
    try {
      if (detailModalItem.type === 'listing') await approveListing(id, comment);
      else if (detailModalItem.type === 'market') await approveMarket(id, comment);
      else if (detailModalItem.type === 'service') await approveService(id, comment);
      else if (detailModalItem.type === 'job') await approveJob(id, comment);

      showToast(`${detailModalItem.typeLabel} approved and published!`, 'success');
      setDetailModalItem(null);
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDetailReject = async (id: string, comment: string) => {
    if (!detailModalItem) return;
    setActionLoading(true);
    try {
      if (detailModalItem.type === 'listing') await rejectListing(id, comment);
      else if (detailModalItem.type === 'market') await rejectMarket(id, comment);
      else if (detailModalItem.type === 'service') await rejectService(id, comment);
      else if (detailModalItem.type === 'job') await rejectJob(id, comment);

      showToast(`${detailModalItem.typeLabel} rejected and feedback logged.`, 'info');
      setDetailModalItem(null);
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
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
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
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                activeTab === 'comments'
                  ? 'border-rose-600 bg-rose-50/60 shadow-sm ring-2 ring-rose-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-rose-600" />
                  Comments
                </span>
                <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                  {approvalComments.length}
                </span>
              </div>
              <span className="mt-1 font-heading text-lg font-extrabold text-gray-900">
                {approvalComments.length}
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
                {activeTab === 'comments' && `Approval Comments Log (${approvalComments.length})`}
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
                            submitterInfo={
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-[#0F766E] font-bold text-xs">
                                  {l.agent?.name ? l.agent.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                                    <span>{l.agent?.name || 'Agent'}</span>
                                    <span className="rounded bg-teal-50 px-1 py-0.2 text-[10px] font-bold text-[#0F766E]">AGENT</span>
                                  </div>
                                  <div className="text-[11px] text-gray-500 font-mono-data">
                                    {l.agent?.phone || l.agent?.email || `ID: ${l.agentId.slice(0, 8)}`}
                                  </div>
                                </div>
                              </div>
                            }
                            onInspect={() => openListingDetail(l)}
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
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                                  {r.client?.name ? r.client.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div className="text-xs">
                                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                    <span>{r.client?.name || 'Client'}</span>
                                    <span className="rounded bg-emerald-50 px-1 py-0.2 text-[10px] font-bold text-emerald-800">CLIENT</span>
                                  </div>
                                  <div className="text-[11px] text-gray-500 font-mono-data">
                                    {r.client?.phone || r.client?.email || '—'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-mono-data font-bold text-emerald-800 inline-block">
                                <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{r.parcelLat}, {r.parcelLng}</span>
                              </span>
                              <div>
                                <Button
                                  variant="secondary"
                                  onClick={() => openGisDetail(r)}
                                  className="text-xs text-[#0F766E] border-teal-200 hover:bg-teal-50 px-2.5 py-1"
                                >
                                  Inspect Details
                                </Button>
                              </div>
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
                          onInspect={() => openMarketDetail(item)}
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
                          submitterInfo={
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-800 font-bold text-xs">
                                {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'P'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                                  <span>{p.user?.name || 'Provider'}</span>
                                  <span className="rounded bg-purple-50 px-1 py-0.2 text-[10px] font-bold text-purple-800">PROVIDER</span>
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono-data">
                                  {p.user?.phone || p.user?.email || '—'}
                                </div>
                              </div>
                            </div>
                          }
                          approveLabel="Verify & Approve"
                          onInspect={() => openServiceDetail(p)}
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
                          submitterInfo={
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                                {job.employer?.name ? job.employer.name.charAt(0).toUpperCase() : 'E'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                                  <span>{job.employer?.name || 'Employer'}</span>
                                  <span className="rounded bg-blue-50 px-1 py-0.2 text-[10px] font-bold text-blue-800">EMPLOYER</span>
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono-data">
                                  {job.employer?.phone || job.employer?.email || '—'}
                                </div>
                              </div>
                            </div>
                          }
                          onInspect={() => openJobDetail(job)}
                          onApprove={() => handleApproveJob(job.id)}
                          onReject={() => openRejectDialog('jobs', job.id, job.title)}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* TAB 6: APPROVAL COMMENTS */}
              {activeTab === 'comments' && (
                <>
                  {approvalComments.length === 0 ? (
                    <EmptyState message="No approval comments recorded yet. Comments appear here after you approve or reject submissions with feedback." />
                  ) : (
                    <div className="space-y-3">
                      {approvalComments.map((c) => (
                        <Card key={c.id} statusRail={c.status === 'PUBLISHED' ? 'published' : 'rejected'} className="p-4 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {c.status === 'PUBLISHED' ? (
                                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-gray-900 truncate">{c.title}</span>
                            </div>
                            <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600 shrink-0">{c.type}</span>
                          </div>
                          <div className="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                            <MessageSquare className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-700 leading-relaxed italic">&ldquo;{c.comment}&rdquo;</p>
                          </div>
                        </Card>
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
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className="w-full flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-rose-500" /> Comment Management
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
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

      {/* Full Detail Moderation Inspection Modal */}
      <ManagerItemDetailModal
        isOpen={Boolean(detailModalItem)}
        item={detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onApprove={handleDetailApprove}
        onReject={handleDetailReject}
        actionLoading={actionLoading}
      />
    </DashboardLayout>
  );
}
