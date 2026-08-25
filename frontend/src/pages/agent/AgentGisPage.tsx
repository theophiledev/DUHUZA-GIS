import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myAssignedGis, updateGisProgress } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest } from '../../types';

export function AgentGisPage() {
  const { tr } = useLanguage();
  const [requests, setRequests] = useState<GisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    myAssignedGis()
      .then(setRequests)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: 'IN_PROGRESS' | 'COMPLETED', reportUrl?: string) => {
    setActionLoading(true);
    try {
      await updateGisProgress(id, { status, ...(reportUrl ? { reportUrl } : {}) });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={tr('assignedGis')}
      subtitle="Cadastral field missions, GNSS RTK boundary demarcations, and official survey report generation."
      actions={
        <Link to="/gis">
          <Button variant="secondary" className="shadow-sm">
            🗺️ Open Interactive GIS Map
          </Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && requests.length === 0 && (
        <EmptyState message="No GIS survey missions assigned to your account yet." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((r) => (
          <Card key={r.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="text-xs font-mono text-gray-400">ID: {r.id.slice(0, 8)}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">{r.purpose}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Client: <span className="font-semibold text-gray-800">{r.client?.name || 'Client'}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800">
                  📍 {r.parcelLat}, {r.parcelLng}
                </span>
              </div>
            </div>

            {/* Client Contact & Direct Actions */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-gray-500">Client Contact:</span>{' '}
                <span className="font-bold text-gray-800">{r.client?.phone || '—'}</span>
              </div>
              {r.client?.phone && (
                <a
                  href={`https://wa.me/${r.client.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 transition"
                >
                  WhatsApp Client 💬
                </a>
              )}
            </div>

            {/* Status Advancement Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                Created: {new Date(r.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2">
                {r.status === 'ASSIGNED' && (
                  <Button
                    variant="primary"
                    className="text-xs bg-brand-600 hover:bg-brand-700"
                    onClick={() => update(r.id, 'IN_PROGRESS')}
                    disabled={actionLoading}
                  >
                    ▶️ {tr('markInProgress')}
                  </Button>
                )}

                {r.status === 'IN_PROGRESS' && (
                  <Button
                    variant="primary"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      const url = prompt(tr('reportUrl'), '/images/gis_sample_report_preview.jpg');
                      if (url) update(r.id, 'COMPLETED', url);
                    }}
                    disabled={actionLoading}
                  >
                    ✓ Complete & Submit Report
                  </Button>
                )}

                {r.reportUrl && (
                  <a
                    href={r.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
                  >
                    📄 Attached Report
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
