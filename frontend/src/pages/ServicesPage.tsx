import { useEffect, useState, useMemo } from 'react';
import { searchServices, getServiceWhatsapp } from '../api';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { SimpleFilterBar } from '../components/FilterBar';
import { ErrorState } from '../components/ErrorState';
import { JobCardSkeletonGrid } from '../components/SkeletonLoaders';
import { Card, EmptyState, PageHeader } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';
import type { ServiceProvider } from '../types';
import { MapPin } from 'lucide-react';

export function ServicesPage() {
  const { tr } = useLanguage();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [filters, setFilters] = useState({ category: '', district: '' });

  const load = () => {
    setLoading(true);
    setError(false);
    searchServices(filters)
      .then((data) => {
        setProviders(data);
        setCurrentPage(1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedProviders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return providers.slice(start, start + pageSize);
  }, [providers, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={tr('services')}
        subtitle="Hire certified plumbers, electricians, drivers, tutors, and professional tradespeople in your district."
      />
      <SimpleFilterBar
        category={filters.category}
        district={filters.district}
        onCategoryChange={(category) => setFilters({ ...filters, category })}
        onDistrictChange={(district) => setFilters({ ...filters, district })}
        onSearch={load}
        tr={tr}
        categoryOptions={[
          { value: '', label: tr('allCategories') },
          { value: 'plumbing', label: tr('servicePlumbing') },
          { value: 'transport', label: tr('serviceTransport') },
          { value: 'tutoring', label: tr('serviceTutoring') },
          { value: 'tailoring', label: tr('serviceTailoring') },
        ]}
      />

      {loading && <JobCardSkeletonGrid count={pageSize} />}
      {error && !loading && <ErrorState onRetry={load} titleKey="errorLoadServices" />}
      {!loading && !error && providers.length === 0 && <EmptyState message={tr('noResults')} />}

      {!loading && !error && providers.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProviders.map((p) => (
              <Card key={p.id} className="flex flex-col p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded-full bg-purple-100 text-purple-900 text-xs font-bold px-2.5 py-0.5 capitalize">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-1.5">{p.user?.name || 'Verified Provider'}</h3>
                  </div>
                  {p.rateInfo && (
                    <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-bold text-brand-800">
                      {p.rateInfo}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />Coverage: {p.coverageDistrict || 'Rwanda'}</span>
                </p>

                <p className="line-clamp-3 flex-1 text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg">
                  {p.description}
                </p>

                <div className="pt-2 border-t border-gray-100">
                  <WhatsAppButton
                    label={tr('contactWhatsapp')}
                    fetchUrl={() => getServiceWhatsapp(p.id)}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={providers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
            itemLabel={tr('services').toLowerCase()}
          />
        </div>
      )}
    </div>
  );
}
