import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myMarketItems } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, formatPrice, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { MarketItem } from '../../types';

export function ClientMarketPage() {
  const { tr } = useLanguage();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    myMarketItems()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout
      title={tr('myMarketItems')}
      subtitle="Manage items you have listed on Isoko marketplace (electronics, furniture, produce, vehicles)."
      actions={
        <Link to="/dashboard/client/market/new">
          <Button variant="primary">➕ {tr('createMarketItem')}</Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="You have not listed any items on the marketplace yet." />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="rounded bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 uppercase">
                {item.category}
              </span>
              <StatusBadge status={item.status} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-base line-clamp-1">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                📍 {item.district || 'Rwanda'}, {item.sector || ''}
              </p>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg">
              {item.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-base font-extrabold text-amber-800">
                {formatPrice(item.price, item.currency)}
              </span>
              {item.status === 'PUBLISHED' && (
                <Link to={`/market/${item.id}`} className="text-xs font-bold text-brand-700 hover:underline">
                  View Live Item ↗
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
