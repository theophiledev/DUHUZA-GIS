import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assignGis, listUsers, pendingGis } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminUser, GisRequest } from '../../types';

export function ManagerGisPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<GisRequest[]>([]);
  const [agents, setAgents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentIds, setAgentIds] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<string | null>(null);

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
          <Button variant="secondary" className="shadow-sm">
            🗺️ Open Interactive GIS Map
          </Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No pending GIS survey missions waiting for assignment." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="text-xs font-mono text-gray-400">ID: {r.id.slice(0, 8)}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">{r.purpose}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Client: <span className="font-semibold text-gray-800">{r.client?.name}</span> ({r.client?.phone || '—'})
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800">
                  📍 {r.parcelLat}, {r.parcelLng}
                </span>
              </div>
            </div>

            {/* Assignment Box */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 space-y-2">
              <div className="text-xs font-bold text-gray-700">
                {r.assignedAgent ? 'Assigned Field Surveyor:' : 'Select Certified Surveyor (Agent):'}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={agentIds[r.id] || r.assignedAgentId || ''}
                  onChange={(e) => setAgentIds({ ...agentIds, [r.id]: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
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
                  className="text-xs whitespace-nowrap px-4 py-1.5"
                  onClick={() => handleAssign(r.id)}
                  disabled={assigning === r.id}
                >
                  {assigning === r.id ? tr('loading') : r.assignedAgentId ? 'Reassign' : 'Assign Mission'}
                </Button>
              </div>

              {r.assignedAgent && (
                <div className="text-xs text-emerald-800 font-semibold pt-1">
                  ✓ Surveyor Contact: {r.assignedAgent.name} · {r.assignedAgent.phone || 'No phone'}
                </div>
              )}
            </div>

            {r.reportUrl && (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Official Report Attached</span>
                <a href={r.reportUrl} target="_blank" rel="noreferrer" className="font-bold text-brand-700 underline">
                  Download Report 📄
                </a>
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
