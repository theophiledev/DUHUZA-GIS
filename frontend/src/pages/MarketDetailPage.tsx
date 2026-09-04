import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMarketItem, getMarketWhatsapp } from '../api';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Card, ErrorAlert, formatPrice } from '../components/ui';
import { SmartImage } from '../components/SmartImage';
import { ImageLightbox } from '../components/ImageLightbox';
import { DetailSkeleton } from '../components/SkeletonLoaders';
import { showToast } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';
import { Share2 } from 'lucide-react';
import { PinIcon } from '../components/FilterBar';
import { ReviewsAndComments } from '../components/ReviewsAndComments';
import type { MarketItem } from '../types';

export function MarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tr } = useLanguage();
  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getMarketItem(id)
      .then(setItem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Item link copied to clipboard!', 'success');
    }
  };

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorAlert message={error} />;
  if (!item) return null;

  const mediaList = item.media?.length
    ? item.media.map((m) => ({ url: m.url, title: item.title }))
    : [];

  const mainPhoto = mediaList[0]?.url;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-brand-700">{tr('home')}</Link>
          <span>/</span>
          <Link to="/market" className="hover:text-brand-700">{tr('market')}</Link>
          <span>/</span>
          <span className="font-semibold text-gray-800 truncate max-w-xs">{item.title}</span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
        >
          <Share2 size={16} strokeWidth={1.75} />
          <span>Share Item</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Photo Gallery */}
        <div className="space-y-3 lg:col-span-7">
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
              alt={item.title}
              fallbackType="market"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              containerClassName="h-full w-full"
            />
            <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3.5 py-1.5 text-base font-extrabold text-amber-800 shadow backdrop-blur">
              {formatPrice(item.price, item.currency)}
            </div>
          </div>

          {/* Thumbnails */}
          {mediaList.length > 1 && (
            <div className="grid grid-cols-4 gap-2.5">
              {mediaList.map((m, i) => (
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
                    fallbackType="market"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    containerClassName="h-full w-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Seller Lead Button */}
        <div className="space-y-5 lg:col-span-5">
          <Card className="p-6 border border-gray-200 shadow-sm space-y-4">
            <div>
              <span className="rounded-full bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 uppercase">
                {item.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mt-2">
                {item.title}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                <PinIcon className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{item.district || 'Rwanda'}{item.sector ? `, ${item.sector}` : ''}</span>
              </p>
            </div>

            <div className="text-3xl font-extrabold text-amber-800">
              {formatPrice(item.price, item.currency)}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">{tr('description')}</h3>
              <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <WhatsAppButton
                label="Contact Seller via WhatsApp"
                fetchUrl={() => getMarketWhatsapp(item.id)}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Ratings, Comments & Verified Reviews Section */}
      <ReviewsAndComments
        itemId={item.id}
        itemType="market"
        itemTitle={item.title}
        approvalComment={item.approvalComment || undefined}
      />

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
