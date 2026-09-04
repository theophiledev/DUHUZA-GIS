import { useEffect, useState, useMemo } from 'react';
import { searchServices, getServiceWhatsapp } from '../api';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { SimpleFilterBar } from '../components/FilterBar';
import { ErrorState } from '../components/ErrorState';
import { JobCardSkeletonGrid } from '../components/SkeletonLoaders';
import { Card, EmptyState, PageHeader } from '../components/ui';
import { SmartImage } from '../components/SmartImage';
import { Pagination } from '../components/Pagination';
import { ReviewsAndComments } from '../components/ReviewsAndComments';
import { useLanguage } from '../context/LanguageContext';
import type { ServiceProvider } from '../types';
import { MapPin, Star, MessageSquare, X } from 'lucide-react';

function getServiceImage(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('electric') || cat.includes('solar')) return '/images/service_electrician.jpg';
  if (cat.includes('paint')) return '/images/service_painting.jpg';
  if (cat.includes('mechanic') || cat.includes('auto')) return '/images/service_mechanic.jpg';
  if (cat.includes('cater') || cat.includes('chef') || cat.includes('event')) return '/images/service_catering.jpg';
  if (cat.includes('plumb')) return '/images/service_plumbing.jpg';
  if (cat.includes('gis') || cat.includes('survey')) return '/images/service_surveyor.jpg';
  return '/images/service_surveyor.jpg';
}

export function ServicesPage() {
  const { tr } = useLanguage();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [filters, setFilters] = useState({ category: '', district: '' });

  // Reviews modal for selected provider
  const [selectedProviderForReviews, setSelectedProviderForReviews] = useState<ServiceProvider | null>(null);

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
          { value: 'electrician', label: 'Electrician & Solar' },
          { value: 'painting', label: 'Painting & Finishes' },
          { value: 'mechanic', label: 'Automotive & Mechanic' },
          { value: 'catering', label: 'Catering & Events' },
          { value: 'surveying', label: 'GIS & Land Surveying' },
        ]}
      />

      {loading && <JobCardSkeletonGrid count={pageSize} />}
      {error && !loading && <ErrorState onRetry={load} titleKey="errorLoadServices" />}
      {!loading && !error && providers.length === 0 && <EmptyState message={tr('noResults')} />}

      {!loading && !error && providers.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProviders.map((p) => (
              <Card key={p.id} className="group flex flex-col overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
                {/* Service Header Media Banner */}
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <SmartImage
                    src={getServiceImage(p.category)}
                    alt={p.category}
                    fallbackType="general"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    containerClassName="h-full w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/90 backdrop-blur text-purple-900 text-xs font-bold px-2.5 py-0.5 shadow-sm">
                      {p.category}
                    </span>
                    {p.rateInfo && (
                      <span className="rounded bg-brand-600/90 backdrop-blur px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                        {p.rateInfo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-base">{p.user?.name || 'Verified Provider'}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>5.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />Coverage: {p.coverageDistrict || 'Rwanda'}</span>
                  </p>

                  <p className="line-clamp-3 flex-1 text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg">
                    {p.description}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProviderForReviews(p)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/70 py-1.5 text-xs font-bold text-[#0F766E] hover:bg-teal-100 transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>View Reviews & Ratings</span>
                    </button>

                    <WhatsAppButton
                      label={tr('contactWhatsapp')}
                      fetchUrl={() => getServiceWhatsapp(p.id)}
                    />
                  </div>
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

      {/* Service Provider Reviews Modal */}
      {selectedProviderForReviews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  {selectedProviderForReviews.user?.name || 'Service Provider'}
                </h3>
                <p className="text-xs text-gray-500 capitalize">{selectedProviderForReviews.category} • Coverage: {selectedProviderForReviews.coverageDistrict || 'Rwanda'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProviderForReviews(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ReviewsAndComments
              itemId={selectedProviderForReviews.id}
              itemType="service"
              itemTitle={selectedProviderForReviews.user?.name || selectedProviderForReviews.category}
              approvalComment={selectedProviderForReviews.approvalComment || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
