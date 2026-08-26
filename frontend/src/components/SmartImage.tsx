import { useState } from 'react';
import { FileText, Home, Image, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'property' | 'market' | 'avatar' | 'document' | 'general';
  containerClassName?: string;
}

export function SmartImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackType = 'general',
  ...props
}: SmartImageProps) {
  const { tr } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fallbackIcons: Record<string, React.ReactNode> = {
    property: <Home size={40} strokeWidth={1.5} />,
    market: <ShoppingCart size={40} strokeWidth={1.5} />,
    avatar: <User size={40} strokeWidth={1.5} />,
    document: <FileText size={40} strokeWidth={1.5} />,
    general: <Image size={40} strokeWidth={1.5} />,
  };

  const hasValidSrc = Boolean(src && typeof src === 'string' && src.trim().length > 0 && !error);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer Placeholder while loading */}
      {!loaded && hasValidSrc && (
        <div className="absolute inset-0 z-0 animate-shimmer bg-gray-200" />
      )}

      {hasValidSrc ? (
        <img
          src={src}
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
