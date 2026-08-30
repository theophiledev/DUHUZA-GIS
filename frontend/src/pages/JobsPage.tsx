import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { searchJobs } from '../api';
import { ErrorState } from '../components/ErrorState';
import { JobCardSkeletonGrid } from '../components/SkeletonLoaders';
import { Button, Card, EmptyState, PageHeader, StatusBadge } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';
import type { Job } from '../types';
import { BadgeCheck, BriefcaseBusiness, Building2, CalendarDays, Clock3, ExternalLink, MapPin, Search, Wallet } from 'lucide-react';

const MIFOTRA_ADVERTISEMENTS_URL = 'https://recruitment.mifotra.gov.rw/applicant/advertisements';
const jobCategoryKeys = ['allOpportunities', 'technology', 'landAndGis', 'operations', 'marketing', 'internships'] as const;

function getJobCategory(job: Job) {
  const title = job.title.toLowerCase();
  if (title.includes('intern')) return 'Internships';
  if (title.includes('survey') || title.includes('field')) return 'Land and GIS';
  if (title.includes('developer')) return 'Technology';
  if (title.includes('marketing')) return 'Marketing';
  return 'Operations';
}

function getJobCategoryKey(job: Job) {
  const category = getJobCategory(job);
  return category === 'Technology' ? 'technology'
    : category === 'Land and GIS' ? 'landAndGis'
      : category === 'Marketing' ? 'marketing'
        : category === 'Internships' ? 'internships' : 'operations';
}

function getJobCategoryLabel(job: Job, tr: (key: import('../i18n/translations').TranslationKey) => string) {
  const key = getJobCategoryKey(job);
  return tr(key);
}

function getJobImage(job: Job) {
  const category = getJobCategory(job);
  if (category === 'Technology') return '/images/office_commercial_kigali.jpg';
  if (category === 'Land and GIS') return '/images/gis_field_surveyor.jpg';
  if (category === 'Marketing') return '/images/market_smartphone.jpg';
  if (category === 'Internships') return '/images/warehouse_logistics.jpg';
  return '/images/commercial_kigali.jpg';
}

export function JobsPage() {
  const { tr } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('allOpportunities');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const load = () => {
    setLoading(true);
    setError(false);
    searchJobs({ location })
      .then((data) => {
        setJobs(data);
        setCurrentPage(1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const filteredJobs = category === 'allOpportunities'
      ? jobs
      : jobs.filter((job) => getJobCategoryKey(job) === category);
    return filteredJobs.slice(start, start + pageSize);
  }, [jobs, currentPage, pageSize, category]);

  const visibleJobs = category === 'allOpportunities'
    ? jobs
    : jobs.filter((job) => getJobCategoryKey(job) === category);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-[#D9E4DF] bg-white shadow-sm">
        <div className="border-b border-[#E8EFEC] bg-[#F4F8F6] px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">Duhuza E-Recruitment</p>
              <h1 className="mt-1 text-2xl font-bold text-[#16241F]">{tr('jobs')}</h1>
              <p className="mt-1 text-sm text-[#5B6B66]">{tr('findNextRole')}</p>
            </div>
            <a href={MIFOTRA_ADVERTISEMENTS_URL} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="inline-flex items-center gap-2 whitespace-nowrap font-semibold">
                <ExternalLink size={16} strokeWidth={1.75} />
                {tr('mifotraVacancies')}
              </Button>
            </a>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-7">
          <div className="flex items-center gap-3 rounded-xl border border-[#D9E4DF] bg-white px-4 py-3">
            <Search size={18} strokeWidth={1.75} className="shrink-0 text-[#0F766E]" />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') load();
              }}
              placeholder={tr('searchByLocation')}
              aria-label={tr('searchByLocation')}
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            <button type="button" onClick={load} className="shrink-0 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0B5F59]">
              Search
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
            <Building2 size={18} strokeWidth={1.75} />
            <span><strong>{tr('liveSource')}:</strong> MIFOTRA portal</span>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={tr('duhuzaOpportunities')}
          subtitle={tr('findNextRole')}
        />
        {!loading && !error && <p className="text-sm font-medium text-gray-500">{visibleJobs.length} open opportunities</p>}
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-1">
        {jobCategoryKeys.map((jobCategoryKey) => (
          <button
            key={jobCategoryKey}
            type="button"
            onClick={() => {
              setCategory(jobCategoryKey);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${
              category === jobCategoryKey
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {tr(jobCategoryKey)}
          </button>
        ))}
      </div>

      {loading && <JobCardSkeletonGrid count={pageSize} />}
      {error && !loading && <ErrorState onRetry={load} titleKey="errorLoadJobs" />}
      {!loading && !error && jobs.length === 0 && <EmptyState message={tr('noResults')} />}

      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="group block">
                <Card className="h-full overflow-hidden border border-gray-200 p-0 shadow-sm transition hover:-translate-y-0.5 hover:border-[#74B8AE] hover:shadow-lg">
                  <div className="relative h-36 overflow-hidden bg-gray-100">
                    <img src={getJobImage(job)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0F766E]">
                      {getJobCategoryLabel(job, tr)}
                    </span>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 font-bold text-gray-900 transition group-hover:text-[#0F766E]">
                        {job.title}
                      </h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Building2 size={14} strokeWidth={1.75} />
                      {job.employer?.name || 'Verified Duhuza employer'}
                      <BadgeCheck size={14} strokeWidth={1.75} className="text-[#0F766E]" />
                    </p>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <p className="inline-flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.75} className="text-[#0F766E]" />{job.location || 'Rwanda'}</p>
                      {job.salaryRange && <p className="inline-flex items-center gap-1.5"><Wallet size={14} strokeWidth={1.75} className="text-[#0F766E]" />{job.salaryRange}</p>}
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">{job.description}</p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                      <span className="inline-flex items-center gap-1"><Clock3 size={13} strokeWidth={1.75} />{tr('posted')} {new Date(job.createdAt).toLocaleDateString()}</span>
                      {job.deadline && <span className="inline-flex items-center gap-1 font-semibold text-amber-700"><CalendarDays size={13} strokeWidth={1.75} />{tr('closes')} {new Date(job.deadline).toLocaleDateString()}</span>}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0F766E] group-hover:underline">{tr('viewOpportunity')} <BriefcaseBusiness size={15} strokeWidth={1.75} /></span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={visibleJobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
            itemLabel={tr('jobs').toLowerCase()}
          />
        </div>
      )}
    </div>
  );
}
