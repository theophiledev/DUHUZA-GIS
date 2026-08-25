import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createGisRequest, myGisRequests } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, Input, LoadingSpinner, Select, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest } from '../../types';

const SURVEY_PURPOSES = [
  { value: 'Boundary Demarcation / Verification (UPI)', label: 'Cadastral Boundary Demarcation / Verification (UPI)' },
  { value: 'Topographical & 3D Contour Survey', label: 'Topographical & 3D Contour Survey' },
  { value: 'Land Partitioning & Subdivision', label: 'Land Partitioning & Subdivision' },
  { value: 'Title Transfer & UPI Verification', label: 'Title Transfer & UPI Verification' },
  { value: 'Construction Permit & Alignment', label: 'Construction Permit & Master Plan Alignment' },
  { value: 'Agricultural & Large Estate Mapping', label: 'Agricultural & Large Estate Mapping' },
];

export function ClientGisPage() {
  const { tr } = useLanguage();
  const [requests, setRequests] = useState<GisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ parcelLat: '-1.9501', parcelLng: '30.0589', purpose: SURVEY_PURPOSES[0].value, upiNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    myGisRequests()
      .then(setRequests)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const purposeFinal = form.upiNumber
        ? `${form.purpose} (UPI: ${form.upiNumber})`
        : form.purpose;

      await createGisRequest({
        parcelLat: Number(form.parcelLat),
        parcelLng: Number(form.parcelLng),
        purpose: purposeFinal,
      });
      setForm({ parcelLat: '-1.9501', parcelLng: '30.0589', purpose: SURVEY_PURPOSES[0].value, upiNumber: '' });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : tr('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title={tr('gisRequest')}
      subtitle="Request official land survey missions, cadastral demarcation, UPI verification, and download certified surveyor reports."
      actions={
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Hide Form' : '➕ Request New Survey'}
          </Button>
          <Link to="/gis">
            <Button variant="secondary">🗺️ Open Map</Button>
          </Link>
        </div>
      }
    >
      {/* Request Form Drawer / Card */}
      {showForm && (
        <Card className="mb-6 p-6 border-2 border-brand-300 shadow-lg bg-gradient-to-br from-white to-emerald-50/30 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Submit Land Survey Request</h3>
              <p className="text-xs text-gray-500">
                A licensed surveyor accredited by RLMUA will be assigned to survey your parcel.
              </p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Select
                  label={tr('surveyPurpose')}
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                >
                  {SURVEY_PURPOSES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>

              <Input
                label="UPI (Unique Parcel Identifier) — Optional"
                placeholder="e.g. 1/03/08/04/1234"
                value={form.upiNumber}
                onChange={(e) => setForm({ ...form, upiNumber: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Latitude"
                  value={form.parcelLat}
                  onChange={(e) => setForm({ ...form, parcelLat: e.target.value })}
                  required
                />
                <Input
                  label="Longitude"
                  value={form.parcelLng}
                  onChange={(e) => setForm({ ...form, parcelLng: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
                {tr('cancel')}
              </Button>
              <Button type="submit" disabled={submitting} className="px-6 shadow-md">
                {submitting ? tr('loading') : 'Submit Survey Request'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && requests.length === 0 && (
        <EmptyState message="You have not requested any land surveys yet. Click 'Request New Survey' above to start!" />
      )}

      {/* Survey Requests Timeline List */}
      <div className="space-y-4">
        {requests.map((r) => {
          const stepIndex =
            r.status === 'REQUESTED' ? 1 : r.status === 'ASSIGNED' ? 2 : r.status === 'IN_PROGRESS' ? 3 : 4;

          return (
            <Card key={r.id} className="p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-xs font-mono text-gray-400">ID: {r.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{r.purpose}</h3>
                  <p className="text-xs text-gray-500">
                    Submitted on: {new Date(r.createdAt).toLocaleDateString()} · 📍 Coordinates: {r.parcelLat}, {r.parcelLng}
                  </p>
                </div>

                {r.reportUrl && (
                  <a
                    href={r.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <span>📄</span>
                    <span>Download Official Report</span>
                  </a>
                )}
              </div>

              {/* Progress Steps Visualizer */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Survey Progress:</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div
                    className={`rounded-lg p-2 font-semibold ${
                      stepIndex >= 1 ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    1. Requested
                  </div>
                  <div
                    className={`rounded-lg p-2 font-semibold ${
                      stepIndex >= 2 ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    2. Surveyor Assigned
                  </div>
                  <div
                    className={`rounded-lg p-2 font-semibold ${
                      stepIndex >= 3 ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    3. Field Work (RTK)
                  </div>
                  <div
                    className={`rounded-lg p-2 font-semibold ${
                      stepIndex >= 4 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    4. Report Ready ✓
                  </div>
                </div>

                {r.assignedAgent && (
                  <div className="mt-3 pt-2 border-t border-gray-200/80 text-xs text-gray-700 flex items-center justify-between">
                    <span>
                      Assigned Surveyor: <strong>{r.assignedAgent.name}</strong>
                    </span>
                    {r.assignedAgent.phone && (
                      <a
                        href={`https://wa.me/${r.assignedAgent.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Contact Surveyor (WhatsApp) 💬
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
