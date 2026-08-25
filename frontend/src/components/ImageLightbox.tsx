import { useEffect, useCallback } from 'react';

interface ImageLightboxProps {
  images: { url: string; title?: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
}: ImageLightboxProps) {
  const total = images.length;

  const handlePrev = useCallback(() => {
    onSelectIndex((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onSelectIndex]);

  const handleNext = useCallback(() => {
    onSelectIndex((currentIndex + 1) % total);
  }, [currentIndex, total, onSelectIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling while lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || total === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar: Counter & Close */}
      <div className="flex w-full max-w-6xl items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider">
            {currentIndex + 1} / {total}
          </span>
          {currentImage.title && (
            <span className="text-sm font-semibold text-gray-200 truncate max-w-md">
              {currentImage.title}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white transition hover:bg-white/30 hover:scale-105"
          aria-label="Close Lightbox"
        >
          ✕
        </button>
      </div>

      {/* Center Display: Main Image & Navigation Arrows */}
      <div className="relative flex flex-1 w-full max-w-5xl items-center justify-center py-4">
        {total > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-2xl font-bold text-white shadow-xl backdrop-blur transition hover:bg-black/80 hover:scale-110"
            aria-label="Previous Image"
          >
            ‹
          </button>
        )}

        <div className="relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl shadow-2xl">
          <img
            src={currentImage.url}
            alt={currentImage.title || 'Enlarged photo'}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl transition-all duration-300"
          />
        </div>

        {total > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-2xl font-bold text-white shadow-xl backdrop-blur transition hover:bg-black/80 hover:scale-110"
            aria-label="Next Image"
          >
            ›
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {total > 1 && (
        <div className="flex max-w-4xl gap-2 overflow-x-auto p-2 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                currentIndex === idx
                  ? 'ring-2 ring-brand-500 scale-105 opacity-100 shadow-md'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
