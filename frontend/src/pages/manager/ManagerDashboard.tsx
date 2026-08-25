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
  EmptyState,
  ErrorAlert,
  formatPrice,
  LoadingSpinner,
  StatusBadge,
} from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminUser, GisRequest, InternalListing, Job, MarketItem, ServiceProvider } from '../../types';

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
  const [serviceProviders, setServiceProviders] = useState<(ServiceProvider & { user: { id: string; name: string; phone?: string } })[]>([]);
  const [jobs, setJobs] = useState<(Job & { employer: { id: string; name: string; phone?: string } })[]>([]);
  const [agents, setAgents] = useState<AdminUser[]>([]);

  // Action states
  const [selectedAgentForGis, setSelectedAgentForGis] = useState<Record<string, string>>({});
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    type: VerticalTab;
    id: string;
    title: string;
  }>({ open: false, type: 'listings', id: '', title: '' });
  const [rejectComment, setRejectComment] = useState('');
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
      loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Rejection Dialog Handler
  const openRejectDialog = (type: VerticalTab, id: string, title: string) => {
    setRejectModal({ open: true, type, id, title });
    setRejectComment('');
  };

  const handleConfirmReject = async () => {
    if (!rejectComment.trim() || rejectComment.trim().length < 3) {
      alert('A specific reason for rejection is required (minimum 3 characters).');
      return;
    }

    setActionLoading(true);
    try {
      if (rejectModal.type === 'listings') await rejectListing(rejectModal.id, rejectComment);
      else if (rejectModal.type === 'market') await rejectMarket(rejectModal.id, rejectComment);
      else if (rejectModal.type === 'services') await rejectService(rejectModal.id, rejectComment);
      else if (rejectModal.type === 'jobs') await rejectJob(rejectModal.id, rejectComment);

      setRejectModal({ open: false, type: 'listings', id: '', title: '' });
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
                ? 'border-t-brand-600 bg-brand-50/40 shadow-md ring-2 ring-brand-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">🏠 {tr('listings')}</span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                {listings.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">{listings.length}</div>
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
                ? 'border-t-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">🗺️ {tr('gisRequest')}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                {gisRequests.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-800">{gisRequests.length}</div>
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
                ? 'border-t-amber-600 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">🛒 {tr('market')}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {marketItems.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-amber-800">{marketItems.length}</div>
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
                ? 'border-t-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">🛠️ {tr('services')}</span>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                {serviceProviders.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-purple-800">{serviceProviders.length}</div>
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
                ? 'border-t-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                : 'border-t-gray-300 bg-white hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">💼 {tr('jobs')}</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
                {jobs.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-indigo-800">{jobs.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Job vacancies</p>
          </Card>
        </button>
      </div>

      {/* Moderation Stream Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {activeTab === 'listings' && `🏠 Property Listings Queue (${listings.length})`}
            {activeTab === 'gis' && `🗺️ GIS Survey Dispatch Queue (${gisRequests.length})`}
            {activeTab === 'market' && `🛒 Isoko Market Queue (${marketItems.length})`}
            {activeTab === 'services' && `🛠️ Service Providers Queue (${serviceProviders.length})`}
            {activeTab === 'jobs' && `💼 Job Postings Queue (${jobs.length})`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/manager/${activeTab}`}
            className="text-xs font-bold text-brand-700 hover:underline"
          >
            Open Dedicated Page →
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label={tr('loading')} />
      ) : (
        <div className="space-y-4">
          {/* TAB 1: PROPERTY LISTINGS */}
          {activeTab === 'listings' && (
            <>
              {listings.length === 0 ? (
                <EmptyState message="All property listings are reviewed! The queue is clear." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {listings.map((l) => {
                    const title = l.translations?.[0]?.title || `Listing #${l.id.slice(0, 8)}`;

                    return (
                      <Card key={l.id} className="overflow-hidden p-0 border border-gray-200 hover:shadow-md transition">
                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="rounded bg-brand-50 text-brand-700 text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide">
                                {l.category} · {l.listingType}
                              </span>
                              <h3 className="font-bold text-gray-900 text-base mt-1 line-clamp-1">{title}</h3>
                              <p className="text-xs text-gray-500">
                                📍 {l.district || 'Rwanda'}, {l.sector || ''} {l.cell || ''}
                              </p>
                            </div>
                            <span className="text-base font-extrabold text-brand-700 whitespace-nowrap">
                              {formatPrice(l.price, l.currency)}
                            </span>
                          </div>

                          {/* Private Owner Data (Visible to Manager/Admin only) */}
                          <div className="rounded-lg bg-amber-50/80 border border-amber-200/70 p-2.5 text-xs text-amber-900 space-y-0.5">
                            <div className="font-bold text-amber-950 flex items-center gap-1">
                              <span>🔒 Private Owner Info:</span>
                              <span className="font-medium">{l.ownerName || '—'}</span>
                            </div>
                            <div>Phone: <span className="font-mono">{l.ownerPhone || '—'}</span></div>
                            {l.internalNotes && <div>Notes: <em>{l.internalNotes}</em></div>}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-400">
                              Agent ID: <span className="font-mono">{l.agentId.slice(0, 8)}...</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => openRejectDialog('listings', l.id, title)}
                                disabled={actionLoading}
                              >
                                {tr('reject')}
                              </Button>
                              <Button
                                variant="primary"
                                className="text-xs px-4 py-1.5 shadow-sm"
                                onClick={() => handleApproveListing(l.id)}
                                disabled={actionLoading}
                              >
                                ✓ {tr('approve')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
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
                <EmptyState message="No pending GIS survey missions to dispatch." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {gisRequests.map((r) => (
                    <Card key={r.id} className="p-5 border border-gray-200 hover:shadow-md transition space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={r.status} />
                            <span className="text-xs font-mono text-gray-400">ID: {r.id.slice(0, 8)}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mt-1.5 text-base">{r.purpose}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Client: <span className="font-semibold text-gray-800">{r.client?.name}</span> ({r.client?.phone || '—'})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-mono font-bold text-emerald-800">
                            📍 {r.parcelLat}, {r.parcelLng}
                          </span>
                        </div>
                      </div>

                      {/* Surveyor Assignment Box */}
                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-2">
                        <div className="text-xs font-bold text-gray-700">Dispatch Certified Surveyor (Agent)</div>
                        <div className="flex gap-2">
                          <select
                            value={selectedAgentForGis[r.id] || r.assignedAgentId || ''}
                            onChange={(e) =>
                              setSelectedAgentForGis({ ...selectedAgentForGis, [r.id]: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
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
                            className="text-xs whitespace-nowrap px-3 py-1.5"
                            onClick={() => handleAssignGis(r.id)}
                            disabled={actionLoading}
                          >
                            {r.assignedAgentId ? 'Reassign' : 'Assign Mission'}
                          </Button>
                        </div>
                        {r.assignedAgent && (
                          <div className="text-[11px] text-emerald-800 font-medium">
                            Currently assigned to: {r.assignedAgent.name} ({r.assignedAgent.phone || ''})
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
                <EmptyState message="All Isoko marketplace submissions are approved." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {marketItems.map((item) => (
                    <Card key={item.id} className="p-5 border border-gray-200 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="rounded bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5">
                            {item.category}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base mt-1.5">{item.title}</h3>
                          <p className="text-xs text-gray-500">
                            Seller: <span className="font-semibold text-gray-700">{item.seller?.name}</span> ({item.seller?.phone || '—'})
                          </p>
                        </div>
                        <span className="text-base font-extrabold text-amber-800">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg">
                        {item.description}
                      </p>
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <Button
                          variant="secondary"
                          className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => openRejectDialog('market', item.id, item.title)}
                          disabled={actionLoading}
                        >
                          {tr('reject')}
                        </Button>
                        <Button
                          variant="primary"
                          className="text-xs px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => handleApproveMarket(item.id)}
                          disabled={actionLoading}
                        >
                          ✓ {tr('approve')}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 4: SERVICE PROVIDERS */}
          {activeTab === 'services' && (
            <>
              {serviceProviders.length === 0 ? (
                <EmptyState message="No pending service provider registration requests." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {serviceProviders.map((p) => (
                    <Card key={p.id} className="p-5 border border-gray-200 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="rounded bg-purple-100 text-purple-900 text-xs font-bold px-2 py-0.5 capitalize">
                            {p.category}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base mt-1.5">{p.user?.name}</h3>
                          <p className="text-xs text-gray-500">
                            Phone: {p.user?.phone || '—'} · Coverage: {p.coverageDistrict || 'Rwanda'}
                          </p>
                        </div>
                        {p.rateInfo && (
                          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {p.rateInfo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                        {p.description}
                      </p>
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <Button
                          variant="secondary"
                          className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => openRejectDialog('services', p.id, `${p.user?.name} (${p.category})`)}
                          disabled={actionLoading}
                        >
                          {tr('reject')}
                        </Button>
                        <Button
                          variant="primary"
                          className="text-xs px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => handleApproveService(p.id)}
                          disabled={actionLoading}
                        >
                          ✓ Verify & Approve
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 5: JOBS */}
          {activeTab === 'jobs' && (
            <>
              {jobs.length === 0 ? (
                <EmptyState message="No pending job vacancies in queue." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {jobs.map((job) => (
                    <Card key={job.id} className="p-5 border border-gray-200 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                          <p className="text-xs text-gray-500">
                            Employer: <span className="font-semibold">{job.employer?.name}</span> · 📍 {job.location || 'Rwanda'}
                          </p>
                        </div>
                        {job.salaryRange && (
                          <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            {job.salaryRange}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2.5 rounded-lg">
                        {job.description}
                      </p>
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <Button
                          variant="secondary"
                          className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => openRejectDialog('jobs', job.id, job.title)}
                          disabled={actionLoading}
                        >
                          {tr('reject')}
                        </Button>
                        <Button
                          variant="primary"
                          className="text-xs px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => handleApproveJob(job.id)}
                          disabled={actionLoading}
                        >
                          ✓ {tr('approve')}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Mandatory Rejection Reason Dialog Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Reject Submission: <span className="text-red-600">{rejectModal.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, type: 'listings', id: '', title: '' })}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Mandatory Feedback / Rejection Reason (BR6):
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Explain what the submitter needs to correct (e.g., missing photo, incorrect price, unverified UPI)..."
                rows={4}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              />
              <p className="text-[11px] text-gray-500">
                This note will be recorded in the audit log and displayed to the submitter so they can rectify and resubmit.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setRejectModal({ open: false, type: 'listings', id: '', title: '' })}
              >
                {tr('cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmReject}
                disabled={actionLoading || rejectComment.trim().length < 3}
              >
                {actionLoading ? tr('loading') : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
