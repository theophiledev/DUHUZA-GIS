import { useState } from 'react';
import { FileText, Home, Image, ShoppingCart, User, Wrench, Briefcase, MapPin, Car } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type FallbackType = 'property' | 'market' | 'avatar' | 'document' | 'general' | 'service' | 'job' | 'gis' | 'vehicle';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: FallbackType;
  containerClassName?: string;
  useSampleFallback?: boolean;
}

const sampleFallbackUrls: Partial<Record<FallbackType, string>> = {
  property: '/images/house_kigali_modern.jpg',
  market: '/images/market_electronics.jpg',
  gis: '/images/gis_satellite_cadastral.jpg',
  service: '/images/service_surveyor.jpg',
  job: '/images/office_commercial_kigali.jpg',
  vehicle: '/images/car_land_cruiser.jpg',
};

export function SmartImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackType = 'general',
  useSampleFallback = true,
  ...props
}: SmartImageProps) {
  const { tr } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fallbackIcons: Record<string, React.ReactNode> = {
    property: <Home size={36} strokeWidth={1.5} />,
    market: <ShoppingCart size={36} strokeWidth={1.5} />,
    avatar: <User size={36} strokeWidth={1.5} />,
    document: <FileText size={36} strokeWidth={1.5} />,
    service: <Wrench size={36} strokeWidth={1.5} />,
    job: <Briefcase size={36} strokeWidth={1.5} />,
    gis: <MapPin size={36} strokeWidth={1.5} />,
    vehicle: <Car size={36} strokeWidth={1.5} />,
    general: <Image size={36} strokeWidth={1.5} />,
  };

  const sampleUrl = useSampleFallback ? sampleFallbackUrls[fallbackType] : null;
  const effectiveSrc = (src && typeof src === 'string' && src.trim().length > 0 && !error) 
    ? src 
    : (sampleUrl && !error ? sampleUrl : null);

  const hasValidSrc = Boolean(effectiveSrc);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer Placeholder while loading */}
      {!loaded && hasValidSrc && (
        <div className="absolute inset-0 z-0 animate-shimmer bg-gray-200" />
      )}

      {hasValidSrc ? (
        <img
          src={effectiveSrc!}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          className={`transition-opacity duration-500 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      ) : (
        <div className="flex h-full w-full min-h-[140px] flex-col items-center justify-center bg-gray-100 p-4 text-center text-gray-400">
          <span className="text-3xl sm:text-4xl select-none">{fallbackIcons[fallbackType] || fallbackIcons.general}</span>
          <span className="mt-1 text-xs font-medium text-gray-400 select-none">{tr('noPreview')}</span>
        </div>
      )}
    </div>
  );
}

