import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myApplications, myGisRequests, myJobs, myMarketItems, myServiceProfile } from '../../api';
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
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest, Job, MarketItem, ServiceProvider } from '../../types';
import {
  ShoppingBag,
  Briefcase,
  FileText,
  MapPin,
  Wrench,
  PlusCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export function ClientDashboard() {
  const { tr } = useLanguage();
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<
    { id: string; appliedAt: string; status: string; cvUrl?: string; job: Job }[]
  >([]);
  const [gisRequests, setGisRequests] = useState<GisRequest[]>([]);
  const [serviceProfile, setServiceProfile] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [marketRes, jobsRes, appsRes, gisRes, servRes] = await Promise.allSettled([
        myMarketItems(),
        myJobs(),
        myApplications(),
        myGisRequests(),
        myServiceProfile(),
      ]);

      if (marketRes.status === 'fulfilled') setMarketItems(marketRes.value);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value);
      if (gisRes.status === 'fulfilled') setGisRequests(gisRes.value);
      if (servRes.status === 'fulfilled') setServiceProfile(servRes.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout
      title={tr('clientDashboard')}
      subtitle="Your personal self-serve command center for selling goods, posting jobs, tracking job applications, requesting GIS surveys, and managing trade services."
      actions={
        <Link to="/dashboard/client/market/new">
          <Button variant="primary" className="flex items-center gap-1.5 font-bold shadow-xs text-xs">
            <PlusCircle className="h-4 w-4" />
            <span>{tr('createMarketItem')}</span>
          </Button>
        </Link>
      }
    >
      {error && <ErrorAlert message={error} onRetry={loadData} />}

      {/* 1. Activity Metric Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Isoko Market Items */}
        <Link to="/dashboard/client/market" className="group">
          <Card statusRail="approved" className="p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('myMarketItems')}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ShoppingBag className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-gray-900">{marketItems.length}</span>
              <span className="text-xs text-gray-500">items posted</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-amber-800 font-semibold flex justify-between">
              <span>Isoko Marketplace</span>
              <span>Manage Items →</span>
            </div>
          </Card>
        </Link>

        {/* Posted Jobs */}
        <Link to="/dashboard/client/jobs" className="group">
          <Card statusRail="info" className="p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('myJobs')}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Briefcase className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-gray-900">{jobs.length}</span>
              <span className="text-xs text-gray-500">vacancies posted</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-blue-800 font-semibold flex justify-between">
              <span>Employer Hub</span>
              <span>View Vacancies →</span>
            </div>
          </Card>
        </Link>

        {/* My Applications */}
        <Link to="/dashboard/client/applications" className="group">
          <Card statusRail="pending" className="p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('myApplications')}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <FileText className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-gray-900">{applications.length}</span>
              <span className="text-xs text-gray-500">submitted</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-purple-800 font-semibold flex justify-between">
              <span>Jobseeker Tracker</span>
              <span>Track Status →</span>
            </div>
          </Card>
        </Link>

        {/* GIS Survey Requests */}
        <Link to="/dashboard/client/gis" className="group">
          <Card statusRail="assigned" className="p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('gisRequest')}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <MapPin className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-gray-900">{gisRequests.length}</span>
              <span className="text-xs text-gray-500">survey requests</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-emerald-800 font-semibold flex justify-between">
              <span>Land &amp; UPI Demarcations</span>
              <span>Track Surveys →</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* 2. Quick Launch Action Launchpad */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/dashboard/client/market/new" className="group">
          <Card className="h-full border-[#E2E8E6] bg-gradient-to-br from-white to-amber-50/40 p-4 transition hover:border-amber-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-gray-900 text-xs group-hover:text-amber-800">Sell on Isoko</h4>
                <p className="text-[11px] text-gray-500">Post goods for quick sale</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/client/jobs/new" className="group">
          <Card className="h-full border-[#E2E8E6] bg-gradient-to-br from-white to-blue-50/40 p-4 transition hover:border-blue-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-gray-900 text-xs group-hover:text-blue-800">Post a Job Opening</h4>
                <p className="text-[11px] text-gray-500">Find skilled candidates</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/client/gis" className="group">
          <Card className="h-full border-[#E2E8E6] bg-gradient-to-br from-white to-emerald-50/40 p-4 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-gray-900 text-xs group-hover:text-emerald-800">Request Land Survey</h4>
                <p className="text-[11px] text-gray-500">Boundary &amp; UPI reports</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/client/services" className="group">
          <Card className="h-full border-[#E2E8E6] bg-gradient-to-br from-white to-purple-50/40 p-4 transition hover:border-purple-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-gray-900 text-xs group-hover:text-purple-800">Service Profile</h4>
                <p className="text-[11px] text-gray-500">
                  {serviceProfile ? `Status: ${serviceProfile.status}` : 'Register as trade provider'}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Marketplace Items & Posted Jobs (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Recent Market Items */}
          <Card className="p-5 border-[#E2E8E6] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-gray-900 text-base">{tr('myMarketItems')}</h3>
                <p className="text-xs text-gray-500">Goods and merchandise for sale</p>
              </div>
              <Link to="/dashboard/client/market" className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1">
                <span>View All ({marketItems.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner label={tr('loading')} />
            ) : marketItems.length === 0 ? (
              <EmptyState
                message="No market items posted yet."
                actionLabel="Sell on Isoko"
                onAction={() => (window.location.href = '/dashboard/client/market/new')}
              />
            ) : (
              <div className="space-y-3">
                {marketItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 hover:bg-teal-50/20 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <SmartImage
                          src={item.media?.[0]?.url}
                          alt={item.title}
                          fallbackType="market"
                          className="h-full w-full object-cover"
                          containerClassName="h-full w-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-gray-500">
                          {item.category} · <span className="font-bold text-[#0F766E]">{formatPrice(item.price, item.currency)}</span> · {item.district || 'Rwanda'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* My Posted Jobs (Employer Hub) */}
          <Card className="p-5 border-[#E2E8E6] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-gray-900 text-base">{tr('myJobs')} Vacancies</h3>
                <p className="text-xs text-gray-500">Openings you posted to hire talent</p>
              </div>
              <Link to="/dashboard/client/jobs" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                <span>Manage Jobs ({jobs.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner label={tr('loading')} />
            ) : jobs.length === 0 ? (
              <EmptyState
                message="No job vacancies posted yet."
                actionLabel="Post a Job"
                onAction={() => (window.location.href = '/dashboard/client/jobs/new')}
              />
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-gray-100 p-3.5 space-y-2 hover:bg-blue-50/20 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{job.title}</h4>
                        <p className="text-xs text-gray-500">
                          {job.location || 'Rwanda'} · <span className="font-medium text-blue-700">{job.salaryRange || 'Competitive'}</span>
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Applications Tracker, GIS Requests & Service Profile (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Job Applications Tracker */}
          <Card className="p-5 border-[#E2E8E6] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-gray-900 text-sm">{tr('myApplications')}</h3>
                <p className="text-xs text-gray-500">Applications submitted for jobs</p>
              </div>
              <Link to="/dashboard/client/applications" className="text-xs font-bold text-purple-700 hover:underline">
                View All ({applications.length}) →
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner label={tr('loading')} />
            ) : applications.length === 0 ? (
              <EmptyState message="You haven't submitted any job applications yet." />
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{app.job?.title || 'Job Opening'}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-gray-500">{app.job?.location || 'Rwanda'}</p>
                    <p className="text-[10px] text-gray-400">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* GIS Survey Requests Live Tracker */}
          <Card className="p-5 border-[#E2E8E6] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-gray-900 text-sm">{tr('gisRequest')} Tracker</h3>
                <p className="text-xs text-gray-500">Live progress of your cadastral parcel surveys</p>
              </div>
              <Link to="/dashboard/client/gis" className="text-xs font-bold text-emerald-700 hover:underline">
                Track ({gisRequests.length}) →
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner label={tr('loading')} />
            ) : gisRequests.length === 0 ? (
              <EmptyState
                message="No land survey requests submitted yet."
                actionLabel="Request Land Survey"
                onAction={() => (window.location.href = '/dashboard/client/gis')}
              />
            ) : (
              <div className="space-y-3">
                {gisRequests.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-gray-900">{r.purpose}</span>
                      <StatusBadge status={r.status} />
                    </div>

                    <div className="text-[11px] font-mono-data text-gray-500">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} strokeWidth={1.75} />Lat: {r.parcelLat}, Lng: {r.parcelLng}</span>
                    </div>

                    {r.reportUrl && (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-emerald-700 font-semibold">✓ Survey Ready</span>
                        <a
                          href={r.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[#0F766E] underline flex items-center gap-1"
                        >
                          <span>View Report</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Service Provider Profile Card */}
          {serviceProfile && (
            <Card className="p-5 border-[#E2E8E6] bg-purple-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-purple-700" />
                  <h3 className="font-heading font-bold text-gray-900 text-sm">Verified Service Profile</h3>
                </div>
                <StatusBadge status={serviceProfile.status} />
              </div>
              <p className="text-xs text-gray-700">
                <strong>Category:</strong> {serviceProfile.category} · <strong>Coverage:</strong> {serviceProfile.coverageDistrict || 'Rwanda'}
              </p>
              {serviceProfile.rateInfo && (
                <p className="text-xs text-gray-600">
                  <strong>Rates:</strong> {serviceProfile.rateInfo}
                </p>
              )}
              <Link to="/dashboard/client/services" className="block text-xs font-bold text-purple-800 hover:underline">
                Edit Trade Profile &amp; Rates →
              </Link>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
