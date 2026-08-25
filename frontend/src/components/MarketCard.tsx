import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MarketItem } from '../types';
import { formatPrice } from './ui';
import { PinIcon } from './FilterBar';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { SmartImage } from './SmartImage';

function FavoriteButton({ id }: { id: string }) {
  const [fav, setFav] = useState(() => isFavorite('market', id));

  return (
    <button
      type="button"
      aria-label="Favorite"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavorite('market', id));
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-md backdrop-blur transition hover:scale-110"
    >
      {fav ? '❤️' : '🤍'}
    </button>
  );
}

export function MarketCard({ item }: { item: MarketItem }) {
  const img = item.media?.[0]?.url;
  const location = [item.district, item.sector].filter(Boolean).join(', ') || '—';

  return (
    <Link to={`/market/${item.id}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 duration-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <SmartImage
            src={img}
            alt={item.title}
            fallbackType="market"
            className="card-image-zoom h-full w-full object-cover"
            containerClassName="h-full w-full"
          />
          <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-amber-800 shadow-sm backdrop-blur">
            {formatPrice(item.price, item.currency)}
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton id={item.id} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{item.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <PinIcon className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span className="line-clamp-1">{location}</span>
          </p>
          <span className="mt-3 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
            {item.category}
          </span>
        </div>
      </article>
    </Link>
  );
}
