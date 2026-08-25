import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myApplications, myGisRequests, myJobs, myMarketItems, myServiceProfile } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, formatPrice, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest, Job, MarketItem, ServiceProvider } from '../../types';

export function ClientDashboard() {
  const { tr } = useLanguage();
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<{ id: string; appliedAt: string; status: string; job: Job }[]>([]);
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
      subtitle="Your personal self-serve hub for selling goods, posting jobs, tracking job applications, requesting GIS surveys, and offering professional services."
      actions={
        <div className="flex gap-2">
          <Link to="/dashboard/client/market/new">
            <Button variant="primary" className="text-xs shadow-md">
              ➕ {tr('createMarketItem')}
            </Button>
          </Link>
        </div>
      }
    >
      {error && <ErrorAlert message={error} onRetry={loadData} />}

      {/* Activity Metric Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Isoko Market Items */}
        <Link to="/dashboard/client/market" className="group">
          <Card className="border-l-4 border-l-amber-500 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-amber-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('myMarketItems')}</span>
              <span className="rounded-lg bg-amber-100 p-2 text-xl text-amber-700">🛒</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{marketItems.length}</span>
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
          <Card className="border-l-4 border-l-indigo-600 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('myJobs')}</span>
              <span className="rounded-lg bg-indigo-100 p-2 text-xl text-indigo-700">💼</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{jobs.length}</span>
              <span className="text-xs text-gray-500">vacancies posted</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-indigo-800 font-semibold flex justify-between">
              <span>Employer Hub</span>
              <span>View Vacancies →</span>
            </div>
          </Card>
        </Link>

        {/* My Applications */}
        <Link to="/dashboard/client/applications" className="group">
          <Card className="border-l-4 border-l-blue-600 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('myApplications')}</span>
              <span className="rounded-lg bg-blue-100 p-2 text-xl text-blue-700">📄</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{applications.length}</span>
              <span className="text-xs text-gray-500">submitted</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-blue-800 font-semibold flex justify-between">
              <span>Jobseeker Tracker</span>
              <span>Track Status →</span>
            </div>
          </Card>
        </Link>

        {/* GIS Survey Requests */}
        <Link to="/dashboard/client/gis" className="group">
          <Card className="border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-emerald-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr('gisRequest')}</span>
              <span className="rounded-lg bg-emerald-100 p-2 text-xl text-emerald-700">🗺️</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{gisRequests.length}</span>
              <span className="text-xs text-gray-500">survey requests</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-emerald-800 font-semibold flex justify-between">
              <span>Land & UPI Mapping</span>
              <span>Track Surveys →</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick Launch Action Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/dashboard/client/market/new" className="group">
          <Card className="h-full border border-gray-200 bg-gradient-to-br from-white to-amber-50/50 p-4 transition hover:border-amber-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-xl text-white shadow-sm">
                🛒
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-amber-700">Sell on Isoko</h4>
                <p className="text-[11px] text-gray-500">Post goods for quick sale</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/client/jobs/new" className="group">
          <Card className="h-full border border-gray-200 bg-gradient-to-br from-white to-indigo-50/50 p-4 transition hover:border-indigo-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white shadow-sm">
                💼
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-700">Post a Job Opening</h4>
                <p className="text-[11px] text-gray-500">Find skilled candidates</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/client/gis" className="group">
          <Card className="h-full border border-gray-200 bg-gradient-to-br from-white to-emerald-50/50 p-4 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-sm">
                🗺️
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700">Request Land Survey</h4>
                <p className="text-[11px] text-gray-500">Boundary & UPI reports</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/client/services" className="group">
          <Card className="h-full border border-gray-200 bg-gradient-to-br from-white to-purple-50/50 p-4 transition hover:border-purple-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl text-white shadow-sm">
                🛠️
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-purple-700">Service Profile</h4>
                <p className="text-[11px] text-gray-500">
                  {serviceProfile ? `Status: ${serviceProfile.status}` : 'Register as provider'}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Two Column Layout: Recent Market Items & GIS Surveys Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Market Items */}
        <Card className="p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900">{tr('myMarketItems')}</h3>
              <p className="text-xs text-gray-500">Active goods & sales status</p>
            </div>
            <Link to="/dashboard/client/market" className="text-xs font-bold text-brand-700 hover:underline">
              View All ({marketItems.length}) →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label={tr('loading')} />
          ) : marketItems.length === 0 ? (
            <EmptyState message="You have not posted any marketplace items yet." />
          ) : (
            <div className="space-y-3">
              {marketItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50/80 transition"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-500">
                      {item.category} · {formatPrice(item.price, item.currency)} · 📍 {item.district || 'Rwanda'}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* GIS Survey Requests Live Tracker */}
        <Card className="p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900">{tr('gisRequest')} Tracker</h3>
              <p className="text-xs text-gray-500">Live progress of your cadastral parcel surveys</p>
            </div>
            <Link to="/dashboard/client/gis" className="text-xs font-bold text-brand-700 hover:underline">
              Manage Surveys ({gisRequests.length}) →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label={tr('loading')} />
          ) : gisRequests.length === 0 ? (
            <EmptyState message="No land survey requests submitted yet." />
          ) : (
            <div className="space-y-3">
              {gisRequests.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-gray-100 p-3.5 space-y-2 hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{r.purpose}</span>
                      <div className="text-xs font-mono text-gray-400">
                        📍 Lat: {r.parcelLat}, Lng: {r.parcelLng}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  {r.reportUrl && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold">✓ Survey Complete</span>
                      <a
                        href={r.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-brand-700 underline"
                      >
                        Download Cadastral Report 📄
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
