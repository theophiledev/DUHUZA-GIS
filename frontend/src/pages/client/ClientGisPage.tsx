import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createGisRequest, myGisRequests } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, Input, LoadingSpinner, Select, StatusBadge } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { GisRequest } from '../../types';
import { MapPin, PlusCircle, ExternalLink, FileText, CheckCircle2, Clock, UserCheck } from 'lucide-react';

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
      showToast('Land survey request submitted successfully!', 'success');
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
          <Button variant="primary" onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 font-bold shadow-xs">
            <PlusCircle className="h-4 w-4" />
            <span>{showForm ? 'Hide Form' : 'Request New Survey'}</span>
          </Button>
          <Link to="/gis">
            <Button variant="secondary" className="flex items-center gap-1.5 font-semibold">
              <MapPin className="h-4 w-4 text-[#0F766E]" />
              <span>Open Map</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* Request Form Drawer / Card */}
      {showForm && (
        <Card statusRail="approved" className="mb-6 p-6 border-[#E2E8E6] shadow-md bg-gradient-to-br from-white to-teal-50/30 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h3 className="font-heading font-bold text-gray-900 text-lg">Submit Land Survey Request</h3>
              <p className="text-xs text-gray-500">
                A licensed surveyor accredited by RLMUA will be assigned to survey your parcel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-700 p-1"
              aria-label="Close form"
            >
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
              <Button type="submit" disabled={submitting} className="px-6 font-bold shadow-xs">
                {submitting ? tr('loading') : 'Submit Survey Request'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && requests.length === 0 && (
        <EmptyState
          message="You have not requested any land surveys yet."
          actionLabel="Request New Survey"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* Survey Requests Timeline List */}
      <div className="space-y-4">
        {requests.map((r) => {
          const stepIndex =
            r.status === 'REQUESTED' ? 1 : r.status === 'ASSIGNED' ? 2 : r.status === 'IN_PROGRESS' ? 3 : 4;
          const normStatus = r.status.toLowerCase().replace(/_/g, '-');

          return (
            <Card key={r.id} statusRail={normStatus as any} className="p-5 border-[#E2E8E6] shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-xs font-mono-data text-gray-400">ID: {r.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 mt-1">{r.purpose}</h3>
                  <p className="text-xs text-gray-500">
                    Submitted on: {new Date(r.createdAt).toLocaleDateString()} · <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />Coordinates: {r.parcelLat}, {r.parcelLng}</span>
                  </p>
                </div>

                {r.reportUrl && (
                  <a
                    href={r.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download Official Report</span>
                    <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                )}
              </div>

              {/* Progress Milestones Bar */}
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                <div className="grid grid-cols-4 text-center text-xs">
                  <div className={`space-y-1 ${stepIndex >= 1 ? 'text-[#0F766E] font-bold' : 'text-gray-400'}`}>
                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-[#0F766E]">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <span>1. Requested</span>
                  </div>
                  <div className={`space-y-1 ${stepIndex >= 2 ? 'text-[#0F766E] font-bold' : 'text-gray-400'}`}>
                    <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${stepIndex >= 2 ? 'bg-teal-100 text-[#0F766E]' : 'bg-gray-100 text-gray-400'}`}>
                      <UserCheck className="h-3.5 w-3.5" />
                    </div>
                    <span>2. Surveyor Assigned</span>
                  </div>
                  <div className={`space-y-1 ${stepIndex >= 3 ? 'text-[#0F766E] font-bold' : 'text-gray-400'}`}>
                    <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${stepIndex >= 3 ? 'bg-teal-100 text-[#0F766E]' : 'bg-gray-100 text-gray-400'}`}>
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <span>3. Field Survey</span>
                  </div>
                  <div className={`space-y-1 ${stepIndex >= 4 ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                    <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${stepIndex >= 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span>4. Certified</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
