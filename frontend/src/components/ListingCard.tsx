import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PublicListing } from '../types';
import { formatPrice } from './ui';
import { PinIcon } from './FilterBar';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { SmartImage } from './SmartImage';

function FavoriteButton({ id, type }: { id: string; type: 'listing' | 'market' }) {
  const [fav, setFav] = useState(() => isFavorite(type, id));

  return (
    <button
      type="button"
      aria-label="Favorite"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavorite(type, id));
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-md backdrop-blur transition hover:scale-110"
    >
      {fav ? '❤️' : '🤍'}
    </button>
  );
}

function SpecBadge({ icon, value }: { icon: string; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      <span>{icon}</span>{value}
    </span>
  );
}

export function ListingCard({ listing }: { listing: PublicListing }) {
  const img = listing.media?.[0]?.url;
  const attrs = listing.attributes ?? {};
  const location = [listing.district, listing.sector, listing.cell, listing.village].filter(Boolean).join(', ') || '—';

  return (
    <Link to={`/listings/${listing.id}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 duration-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <SmartImage
            src={img}
            alt={listing.title ?? ''}
            fallbackType="property"
            className="card-image-zoom h-full w-full object-cover"
            containerClassName="h-full w-full"
          />
          <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-brand-700 shadow-sm backdrop-blur">
            {formatPrice(listing.price, listing.currency)}
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton id={listing.id} type="listing" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{listing.title ?? 'Untitled'}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <PinIcon className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span className="line-clamp-1">{location}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <SpecBadge icon="🛏️" value={attrs.bedrooms} />
            <SpecBadge icon="🚿" value={attrs.bathrooms} />
            <SpecBadge icon="📐" value={attrs.land_size_sqm ? `${attrs.land_size_sqm} m²` : attrs.area} />
            {!attrs.bedrooms && !attrs.bathrooms && !attrs.land_size_sqm && !attrs.area && (
              <SpecBadge icon="🏷️" value={listing.listingType} />
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
