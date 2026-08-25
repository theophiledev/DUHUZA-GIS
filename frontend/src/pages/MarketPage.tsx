import { useEffect, useState, useMemo } from 'react';
import { searchMarket } from '../api';
import { MarketCard } from '../components/MarketCard';
import { SimpleFilterBar } from '../components/FilterBar';
import { ErrorState } from '../components/ErrorState';
import { MarketCardSkeletonGrid } from '../components/SkeletonLoaders';
import { EmptyState, PageHeader } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';
import type { MarketItem } from '../types';

export function MarketPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [filters, setFilters] = useState({ category: '', district: '' });

  const load = () => {
    setLoading(true);
    setError(false);
    searchMarket(filters)
      .then((data) => {
        setItems(data);
        setCurrentPage(1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={tr('market')}
        subtitle="Self-serve marketplace across Rwanda for electronics, furniture, vehicles, and farm produce."
      />
      <SimpleFilterBar
        category={filters.category}
        district={filters.district}
        onCategoryChange={(category) => setFilters({ ...filters, category })}
        onDistrictChange={(district) => setFilters({ ...filters, district })}
        onSearch={load}
        tr={tr}
      />

      {loading && <MarketCardSkeletonGrid count={pageSize} />}
      {error && !loading && <ErrorState onRetry={load} titleKey="errorLoadMarket" />}
      {!loading && !error && items.length === 0 && <EmptyState message={tr('noResults')} />}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item) => (
              <MarketCard key={item.id} item={item} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={items.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
            itemLabel={tr('market').toLowerCase()}
          />
        </div>
      )}
    </div>
  );
}
