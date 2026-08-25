import { useState } from 'react';

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
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fallbackIcons: Record<string, string> = {
    property: '🏠',
    market: '🛒',
    avatar: '👤',
    document: '📄',
    general: '🖼️',
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
          <span className="text-3xl sm:text-4xl select-none">{fallbackIcons[fallbackType] || '🖼️'}</span>
          <span className="mt-1 text-xs font-medium text-gray-400 select-none">No preview available</span>
        </div>
      )}
    </div>
  );
}
