import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myAssignedGis, updateGisProgress } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest } from '../../types';
import { MapPin, ExternalLink, Play, CheckCircle2, MessageSquare } from 'lucide-react';

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
      showToast('GIS mission progress updated!', 'success');
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
          <Button variant="secondary" className="shadow-xs flex items-center gap-1.5 font-semibold">
            <MapPin className="h-4 w-4 text-[#0F766E]" />
            <span>Interactive GIS Map</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && requests.length === 0 && (
        <EmptyState message="Nothing pending — you're caught up." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((r) => {
          const normStatus = r.status.toLowerCase().replace(/_/g, '-');

          return (
            <Card
              key={r.id}
              statusRail={normStatus as any}
              className="p-5 border-[#E2E8E6] shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-xs font-mono-data text-gray-400">ID: {r.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mt-1">{r.purpose}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Client: <span className="font-semibold text-gray-800">{r.client?.name || 'Client'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-mono-data font-bold text-emerald-800">
                    <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{r.parcelLat}, {r.parcelLng}</span>
                  </span>
                </div>
              </div>

              {/* Client Contact & Direct Actions */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Client Contact:</span>{' '}
                  <span className="font-bold text-gray-800 font-mono-data">{r.client?.phone || '—'}</span>
                </div>
                {r.client?.phone && (
                  <a
                    href={`https://wa.me/${r.client.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp Client</span>
                  </a>
                )}
              </div>

              {/* Status Advancement Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div className="text-gray-400">
                  Created: {new Date(r.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  {r.status === 'ASSIGNED' && (
                    <Button
                      variant="primary"
                      className="text-xs font-bold flex items-center gap-1"
                      onClick={() => update(r.id, 'IN_PROGRESS')}
                      disabled={actionLoading}
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>{tr('markInProgress')}</span>
                    </Button>
                  )}

                  {r.status === 'IN_PROGRESS' && (
                    <Button
                      variant="primary"
                      className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1"
                      onClick={() => {
                        const url = prompt(tr('reportUrl'), '/images/gis_sample_report_preview.jpg');
                        if (url) update(r.id, 'COMPLETED', url);
                      }}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Complete & Submit Report</span>
                    </Button>
                  )}

                  {r.reportUrl && (
                    <a
                      href={r.reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-[#0F766E] hover:bg-teal-100 transition flex items-center gap-1"
                    >
                      <span>Attached Report</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
