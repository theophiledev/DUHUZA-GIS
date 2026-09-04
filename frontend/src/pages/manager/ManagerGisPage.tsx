import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assignGis, listUsers, pendingGis } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { ManagerItemDetailModal, type ManagerItemDetailData } from '../../components/ManagerItemDetailModal';
import type { AdminUser, GisRequest } from '../../types';
import { MapPin, ExternalLink, FileText, Eye, User } from 'lucide-react';

export function ManagerGisPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<GisRequest[]>([]);
  const [agents, setAgents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentIds, setAgentIds] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<string | null>(null);
  const [detailModalItem, setDetailModalItem] = useState<ManagerItemDetailData | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [gisRes, usersRes] = await Promise.allSettled([pendingGis(), listUsers()]);
      if (gisRes.status === 'fulfilled') setItems(gisRes.value);
      if (usersRes.status === 'fulfilled') {
        setAgents(usersRes.value.filter((u) => u.role === 'AGENT' && u.isActive));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (gisId: string) => {
    const aid = agentIds[gisId];
    if (!aid) {
      alert('Please select a licensed surveyor (agent) from the list.');
      return;
    }
    setAssigning(gisId);
    try {
      await assignGis(gisId, aid);
      showToast('Cadastral survey mission assigned to surveyor!', 'success');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : tr('error'));
    } finally {
      setAssigning(null);
    }
  };

  return (
    <DashboardLayout
      title={`${tr('gisRequest')} — ${tr('pendingQueue')}`}
      subtitle="Dispatch certified field surveyors (agents) for cadastral boundary demarcations, UPI mapping, and master plan surveys."
      actions={
        <Link to="/gis">
          <Button variant="secondary" className="shadow-xs flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#0F766E]" />
            <span>Interactive GIS Map</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="Nothing pending — you're caught up." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id} statusRail="pending" className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="text-xs font-mono-data text-gray-400">ID: {r.id.slice(0, 8)}</span>
                </div>
                <h3 className="font-heading font-bold text-gray-900 mt-1.5 text-base">{r.purpose}</h3>
                
                {/* Submitter Profile Info */}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {r.client?.name ? r.client.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
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
                <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-mono-data font-bold text-emerald-800 inline-block">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{r.parcelLat}, {r.parcelLng}</span>
                </span>
                <div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setDetailModalItem({
                        id: r.id,
                        type: 'gis',
                        typeLabel: 'GIS Cadastral Survey Mission',
                        title: r.purpose,
                        status: r.status,
                        publicLat: r.parcelLat,
                        publicLng: r.parcelLng,
                        createdAt: r.createdAt,
                        submitter: r.client,
                        assignedAgent: r.assignedAgent,
                        reportUrl: r.reportUrl,
                      })
                    }
                    className="text-xs text-[#0F766E] border-teal-200 hover:bg-teal-50 px-2.5 py-1"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Inspect Details
                  </Button>
                </div>
              </div>
            </div>

            {/* Assignment Box */}
            <div className="rounded-xl border border-[#E2E8E6] bg-gray-50/70 p-3.5 space-y-2">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {r.assignedAgent ? 'Assigned Field Surveyor:' : 'Select Certified Surveyor (Agent):'}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={agentIds[r.id] || r.assignedAgentId || ''}
                  onChange={(e) => setAgentIds({ ...agentIds, [r.id]: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="">-- Choose Active Surveyor Agent --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.phone || ag.email || ag.id.slice(0, 6)})
                    </option>
                  ))}
                </select>

                <Button
                  variant="primary"
                  className="text-xs whitespace-nowrap px-4 py-1.5 font-bold"
                  onClick={() => handleAssign(r.id)}
                  disabled={assigning === r.id}
                >
                  {assigning === r.id ? tr('loading') : r.assignedAgentId ? 'Reassign' : 'Assign Mission'}
                </Button>
              </div>

              {r.assignedAgent && (
                <div className="text-xs text-emerald-800 font-semibold pt-1">
                  ✓ Surveyor Contact: {r.assignedAgent.name} · {r.assignedAgent.phone || r.assignedAgent.email || 'No phone'}
                </div>
              )}
            </div>

            {r.reportUrl && (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">Official Report Attached</span>
                <a href={r.reportUrl} target="_blank" rel="noreferrer" className="font-bold text-[#0F766E] underline">
                  <span className="inline-flex items-center gap-1"><FileText size={14} strokeWidth={1.75} />Download Report</span>
                </a>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Full Detail Inspection Modal */}
      <ManagerItemDetailModal
        isOpen={Boolean(detailModalItem)}
        item={detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onApprove={async () => {
          showToast('GIS request details verified.', 'info');
          setDetailModalItem(null);
        }}
        onReject={async () => {
          showToast('GIS request review completed.', 'info');
          setDetailModalItem(null);
        }}
      />
    </DashboardLayout>
  );
}
