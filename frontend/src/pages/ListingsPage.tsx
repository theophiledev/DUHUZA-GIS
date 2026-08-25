import { useEffect, useState, useMemo } from 'react';
import { searchListings } from '../api';
import { ListingCard } from '../components/ListingCard';
import { ListingFilterBar } from '../components/FilterBar';
import { ErrorState } from '../components/ErrorState';
import { ListingCardSkeletonGrid } from '../components/SkeletonLoaders';
import { EmptyState, PageHeader } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';
import type { PublicListing } from '../types';

export function ListingsPage() {
  const { lang, tr } = useLanguage();
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [filters, setFilters] = useState({
    category: '',
    listingType: '',
    province: '',
    district: '',
    sector: '',
    minPrice: '',
    maxPrice: '',
  });

  const load = () => {
    setLoading(true);
    setError(false);
    const { province: _province, ...searchParams } = filters;
    searchListings(searchParams, lang)
      .then((data) => {
        setListings(data);
        setCurrentPage(1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [lang]);

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return listings.slice(start, start + pageSize);
  }, [listings, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader title={tr('listings')} subtitle={tr('browseProperties')} />
      <ListingFilterBar filters={filters} onChange={setFilters} onSearch={load} tr={tr} />

      {loading && <ListingCardSkeletonGrid count={pageSize} />}
      {error && !loading && <ErrorState onRetry={load} titleKey="errorLoadProperties" />}
      {!loading && !error && listings.length === 0 && <EmptyState message={tr('noResults')} />}

      {!loading && !error && listings.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={listings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
            itemLabel={tr('listings').toLowerCase()}
          />
        </div>
      )}
    </div>
  );
}
