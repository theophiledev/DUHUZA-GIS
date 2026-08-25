import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getListing, getListingWhatsapp } from '../api';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Card, ErrorAlert, formatPrice } from '../components/ui';
import { SmartImage } from '../components/SmartImage';
import { ImageLightbox } from '../components/ImageLightbox';
import { DetailSkeleton } from '../components/SkeletonLoaders';
import { showToast } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';
import { PinIcon } from '../components/FilterBar';
import type { PublicListing } from '../types';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, tr } = useLanguage();
  const [listing, setListing] = useState<PublicListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getListing(id, lang)
      .then(setListing)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, lang]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorAlert message={error} />;
  if (!listing) return null;

  const mediaList = listing.media?.length
    ? listing.media.map((m) => ({ url: m.url, title: listing.title || undefined }))
    : [];

  const mainPhoto = mediaList[0]?.url;
  const locationText =
    [listing.district, listing.sector, listing.cell, listing.village].filter(Boolean).join(', ') || 'Rwanda';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-brand-700">{tr('home')}</Link>
          <span>/</span>
          <Link to="/listings" className="hover:text-brand-700">{tr('listings')}</Link>
          <span>/</span>
          <span className="font-semibold text-gray-800 truncate max-w-xs">{listing.title || 'Details'}</span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
        >
          <span>🔗</span>
          <span>Share Property</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Photo Gallery */}
        <div className="space-y-3 lg:col-span-7">
          {/* Main Hero Photo */}
          <div
            onClick={() => {
              if (mediaList.length > 0) {
                setActiveImageIndex(0);
                setLightboxOpen(true);
              }
            }}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md cursor-pointer"
          >
            <SmartImage
              src={mainPhoto}
              alt={listing.title || ''}
              fallbackType="property"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              containerClassName="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="rounded-lg bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                🔍 Click to open full gallery ({mediaList.length} photos)
              </span>
            </div>
            <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3.5 py-1.5 text-base font-extrabold text-brand-700 shadow backdrop-blur">
              {formatPrice(listing.price, listing.currency)}
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {mediaList.length > 1 && (
            <div className="grid grid-cols-4 gap-2.5">
              {mediaList.slice(0, 4).map((m, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setActiveImageIndex(i);
                    setLightboxOpen(true);
                  }}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 shadow-sm cursor-pointer hover:ring-2 hover:ring-brand-500 transition group"
                >
                  <SmartImage
                    src={m.url}
                    alt=""
                    fallbackType="property"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    containerClassName="h-full w-full"
                  />
                  {i === 3 && mediaList.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-extrabold text-white text-sm">
                      +{mediaList.length - 4} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specifications & Inquiries */}
        <div className="space-y-5 lg:col-span-5">
          <Card className="p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-brand-100 text-brand-800 text-xs font-bold px-3 py-1 uppercase">
                {listing.category} · {listing.listingType}
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {listing.id.slice(0, 8)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {listing.title ?? 'Untitled Property'}
            </h1>

            <p className="flex items-center gap-1.5 text-sm text-gray-600">
              <PinIcon className="h-4 w-4 text-brand-600 shrink-0" />
              <span>{locationText}</span>
            </p>

            <div className="text-3xl font-extrabold text-brand-700">
              {formatPrice(listing.price, listing.currency)}
            </div>

            {listing.isFallbackLanguage && (
              <p className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
                Translation fallback ({listing.originalLanguage})
              </p>
            )}

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">{tr('description')}</h3>
              <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Attributes Grid */}
            {Object.keys(listing.attributes ?? {}).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">{tr('attributes')}</h3>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(listing.attributes).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-gray-50 p-2.5">
                      <dt className="text-gray-500 font-medium capitalize">{k.replace(/_/g, ' ')}</dt>
                      <dd className="font-bold text-gray-900 text-sm mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* WhatsApp Lead Button */}
            <div className="pt-4 border-t border-gray-100">
              <WhatsAppButton
                label={tr('contactWhatsapp')}
                fetchUrl={() => getListingWhatsapp(listing.id)}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox Gallery Modal */}
      <ImageLightbox
        images={mediaList}
        currentIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={setActiveImageIndex}
      />
    </div>
  );
}
