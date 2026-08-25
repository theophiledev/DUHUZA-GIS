import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { searchJobs } from '../api';
import { LocationFilterBar } from '../components/FilterBar';
import { ErrorState } from '../components/ErrorState';
import { JobCardSkeletonGrid } from '../components/SkeletonLoaders';
import { Card, EmptyState, PageHeader, StatusBadge } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';
import type { Job } from '../types';

export function JobsPage() {
  const { tr } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState('');
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
    return jobs.slice(start, start + pageSize);
  }, [jobs, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={tr('jobs')}
        subtitle="Explore employment opportunities, engineering roles, and skilled trades vacancies in Rwanda."
      />
      <LocationFilterBar location={location} onLocationChange={setLocation} onSearch={load} tr={tr} />

      {loading && <JobCardSkeletonGrid count={pageSize} />}
      {error && !loading && <ErrorState onRetry={load} titleKey="errorLoadJobs" />}
      {!loading && !error && jobs.length === 0 && <EmptyState message={tr('noResults')} />}

      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {paginatedJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="group block">
                <Card className="h-full border border-gray-200 p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-indigo-700 transition">
                      {job.title}
                    </h3>
                    <StatusBadge status={job.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                      📍 {job.location || 'Rwanda'}
                    </span>
                    {job.salaryRange && (
                      <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-bold text-indigo-800">
                        💰 {job.salaryRange}
                      </span>
                    )}
                  </div>

                  <p className="line-clamp-2 text-xs text-gray-600 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    <span className="font-bold text-indigo-700 group-hover:underline">
                      Apply Now →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={jobs.length}
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
