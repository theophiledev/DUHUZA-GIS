import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myMarketItems } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, EmptyState, ErrorAlert, formatPrice, LoadingSpinner, StatusBadge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { MarketItem } from '../../types';
import { PlusCircle, ExternalLink, MapPin } from 'lucide-react';

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
          <Button variant="primary" className="flex items-center gap-1.5 font-bold shadow-xs">
            <PlusCircle className="h-4 w-4" />
            <span>{tr('createMarketItem')}</span>
          </Button>
        </Link>
      }
    >
      {loading && <LoadingSpinner label={tr('loading')} />}
      {error && <ErrorAlert message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          message="You have not listed any items on the marketplace yet."
          actionLabel={`+ ${tr('createMarketItem')}`}
          onAction={() => (window.location.href = '/dashboard/client/market/new')}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const normStatus = item.status.toLowerCase().replace(/_/g, '-');

          return (
            <Card
              key={item.id}
              statusRail={normStatus as any}
              className="p-5 border-[#E2E8E6] shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-2 py-0.5 uppercase tracking-wider">
                  {item.category}
                </span>
                <StatusBadge status={item.status} />
              </div>

              <div>
                <h3 className="font-heading font-bold text-gray-900 text-base line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{item.district || 'Rwanda'}, {item.sector || ''}</span>
                </p>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg">
                {item.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-heading text-base font-extrabold text-[#0F766E]">
                  {formatPrice(item.price, item.currency)}
                </span>
                {item.status === 'PUBLISHED' && (
                  <Link
                    to={`/market/${item.id}`}
                    className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-0.5"
                  >
                    <span>View Live Item</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
