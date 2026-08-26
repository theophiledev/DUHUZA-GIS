import { useEffect, useState } from 'react';
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
} from 'lucide-react';

type VerticalTab = 'listings' | 'gis' | 'market' | 'services' | 'jobs';

export function ManagerDashboard() {
  const { tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<VerticalTab>('listings');
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

  return (
    <DashboardLayout
      title={tr('managerDashboard')}
      subtitle={`Moderation triage hub with ${totalPending} pending items across all 5 platform verticals.`}
    >
      {error && <ErrorAlert message={error} onRetry={loadAll} />}

      {/* 5-Vertical KPI Counters Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`text-left transition-all ${activeTab === 'listings' ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
        >
          <Card
            className={`h-full border-t-4 p-4 ${
              activeTab === 'listings'
                ? 'border-t-[#0F766E] bg-teal-50/30 shadow-md ring-2 ring-[#0F766E]/20'
                : 'border-t-gray-300 bg-white hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-[#0F766E]" />
                {tr('listings')}
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-[#0F766E]">
                {listings.length}
              </span>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-gray-900">{listings.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">{tr('pendingReview')}</p>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gis')}
          className={`text-left transition-all ${activeTab === 'gis' ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
        >
          <Card
            className={`h-full border-t-4 p-4 ${
              activeTab === 'gis'
                ? 'border-t-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {tr('gisRequest')}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                {gisRequests.length}
              </span>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-emerald-800">{gisRequests.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Pending dispatch</p>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('market')}
          className={`text-left transition-all ${activeTab === 'market' ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
        >
          <Card
            className={`h-full border-t-4 p-4 ${
              activeTab === 'market'
                ? 'border-t-amber-600 bg-amber-50/30 shadow-md ring-2 ring-amber-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
                {tr('market')}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {marketItems.length}
              </span>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-amber-800">{marketItems.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Isoko submissions</p>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`text-left transition-all ${activeTab === 'services' ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
        >
          <Card
            className={`h-full border-t-4 p-4 ${
              activeTab === 'services'
                ? 'border-t-purple-600 bg-purple-50/30 shadow-md ring-2 ring-purple-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-purple-600" />
                {tr('services')}
              </span>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                {serviceProviders.length}
              </span>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-purple-800">{serviceProviders.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Provider profiles</p>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`text-left transition-all ${activeTab === 'jobs' ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
        >
          <Card
            className={`h-full border-t-4 p-4 ${
              activeTab === 'jobs'
                ? 'border-t-blue-600 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                {tr('jobs')}
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                {jobs.length}
              </span>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-blue-800">{jobs.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Job vacancies</p>
          </Card>
        </button>
      </div>

      {/* Moderation Stream Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8E6] pb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-bold text-gray-900">
            {activeTab === 'listings' && `Property Listings Queue (${listings.length})`}
            {activeTab === 'gis' && `GIS Survey Dispatch Queue (${gisRequests.length})`}
            {activeTab === 'market' && `Isoko Market Queue (${marketItems.length})`}
            {activeTab === 'services' && `Service Providers Queue (${serviceProviders.length})`}
            {activeTab === 'jobs' && `Job Postings Queue (${jobs.length})`}
          </h2>
        </div>
        <Link
          to={`/dashboard/manager/${activeTab}`}
          className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1"
        >
          <span>Open Dedicated Page</span>
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
              {listings.length === 0 ? (
                <EmptyState message="Nothing pending — you're caught up." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {listings.map((l) => {
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
              {gisRequests.length === 0 ? (
                <EmptyState message="Nothing pending — you're caught up." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {gisRequests.map((r) => (
                    <Card key={r.id} statusRail="pending" className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={r.status} />
                            <span className="text-xs font-mono-data text-gray-400">ID: {r.id.slice(0, 8)}</span>
                          </div>
                          <h3 className="font-heading font-bold text-gray-900 mt-1.5 text-base">{r.purpose}</h3>
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
                        <div className="flex gap-2">
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
              {marketItems.length === 0 ? (
                <EmptyState message="Nothing pending — you're caught up." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {marketItems.map((item) => (
                    <ReviewCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      status={item.status}
                      category={item.category}
                      price={item.price}
                      currency={item.currency}
                      description={item.description}
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
              {serviceProviders.length === 0 ? (
                <EmptyState message="Nothing pending — you're caught up." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {serviceProviders.map((p) => (
                    <ReviewCard
                      key={p.id}
                      id={p.id}
                      title={p.user?.name || 'Service Provider'}
                      status={p.status}
                      category={p.category}
                      location={`Coverage: ${p.coverageDistrict || 'Rwanda'}`}
                      tags={p.rateInfo ? [p.rateInfo] : undefined}
                      description={p.description}
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
              {jobs.length === 0 ? (
                <EmptyState message="Nothing pending — you're caught up." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {jobs.map((job) => (
                    <ReviewCard
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      status={job.status}
                      location={job.location || 'Rwanda'}
                      tags={job.salaryRange ? [job.salaryRange] : undefined}
                      description={job.description}
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
