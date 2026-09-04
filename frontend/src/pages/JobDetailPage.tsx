import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { applyToJob, getJob } from '../api';
import { Button, Card, ErrorAlert, Input, LoadingSpinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ReviewsAndComments } from '../components/ReviewsAndComments';
import type { Job } from '../types';
import { BadgeCheck, Building2, CalendarDays, MapPin, Send, Wallet } from 'lucide-react';

function getJobImage(job: Job) {
  const title = job.title.toLowerCase();
  if (title.includes('survey') || title.includes('field')) return '/images/gis_field_surveyor.jpg';
  if (title.includes('developer')) return '/images/office_commercial_kigali.jpg';
  if (title.includes('marketing') || title.includes('design')) return '/images/market_smartphone.jpg';
  if (title.includes('intern') || title.includes('operations')) return '/images/warehouse_logistics.jpg';
  return '/images/commercial_kigali.jpg';
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { tr } = useLanguage();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [applyMsg, setApplyMsg] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    getJob(id).then(setJob).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    setApplyMsg('');
    try {
      await applyToJob(id, cvUrl || undefined);
      setApplyMsg('Application submitted!');
    } catch (e) {
      setApplyMsg(e instanceof Error ? e.message : tr('error'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner label={tr('loading')} />;
  if (error) return <ErrorAlert message={error} />;
  if (!job) return null;

  return (
    <div className="space-y-5">
      <div className="relative h-56 overflow-hidden rounded-2xl bg-gray-900 shadow-sm sm:h-72">
        <img src={getJobImage(job)} alt="" className="h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 sm:left-8 sm:right-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">{tr('duhuzaOpportunities')}</p>
          <h1 className="max-w-3xl text-2xl font-extrabold text-white sm:text-4xl">{job.title}</h1>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="space-y-6 border border-gray-200 p-6 shadow-sm sm:p-8">
          <div className="grid gap-3 border-b border-gray-100 pb-5 sm:grid-cols-2">
            <p className="inline-flex items-center gap-2 text-sm text-gray-600"><Building2 size={17} strokeWidth={1.75} className="text-[#0F766E]" />{job.employer?.name || 'Verified Duhuza employer'} <BadgeCheck size={15} strokeWidth={1.75} className="text-[#0F766E]" /></p>
            <p className="inline-flex items-center gap-2 text-sm text-gray-600"><MapPin size={17} strokeWidth={1.75} className="text-[#0F766E]" />{job.location || 'Rwanda'}</p>
            {job.salaryRange && <p className="inline-flex items-center gap-2 text-sm text-gray-600"><Wallet size={17} strokeWidth={1.75} className="text-[#0F766E]" />{job.salaryRange}</p>}
            {job.deadline && <p className="inline-flex items-center gap-2 text-sm text-gray-600"><CalendarDays size={17} strokeWidth={1.75} className="text-[#0F766E]" />{tr('applyBy')} {new Date(job.deadline).toLocaleDateString()}</p>}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{tr('aboutOpportunity')}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">{job.description}</p>
          </div>
        </Card>

        <Card className="h-fit border border-[#B9DCD4] bg-[#F4F8F6] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">{tr('readyToApply')}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{tr('submitApplication')}</p>
          {user?.role === 'CLIENT' ? (
            <div className="mt-5 space-y-3">
              <Input label="CV URL (optional)" value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} placeholder="https://..." />
              <Button onClick={handleApply} disabled={applying} className="inline-flex w-full items-center justify-center gap-2">
                <Send size={16} strokeWidth={1.75} />
                {applying ? tr('loading') : tr('apply')}
              </Button>
              {applyMsg && <p className="text-sm text-gray-600">{applyMsg}</p>}
            </div>
          ) : (
            <p className="mt-5 border-t border-[#D9EAE5] pt-4 text-sm text-gray-600">{tr('login')} to {tr('apply').toLowerCase()}.</p>
          )}
        </Card>
      </div>

      {/* Ratings & Reviews for this Opportunity / Employer */}
      <ReviewsAndComments
        itemId={job.id}
        itemType="job"
        itemTitle={job.title}
        approvalComment={job.approvalComment || undefined}
      />
    </div>
  );
}
