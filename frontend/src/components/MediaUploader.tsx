import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from './ui';

export interface MediaFile {
  url: string;
  name?: string;
  size?: number;
  type?: string; // 'photo' | 'document'
  isCover?: boolean;
}

interface MediaUploaderProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  allowDocuments?: boolean;
  label?: string;
  helperText?: string;
}

export function MediaUploader({
  mediaUrls,
  onChange,
  maxFiles = 10,
  allowDocuments = false,
  label = 'Photos & Media',
  helperText = 'Drag & drop images, select local files, or paste external photo URLs.',
}: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg('');

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        setErrorMsg(`File "${file.name}" exceeds the 10MB maximum limit.`);
        return;
      }

      const isValidImage = file.type.startsWith('image/');
      const isValidDoc = allowDocuments && (file.type === 'application/pdf' || file.name.endsWith('.geojson'));

      if (!isValidImage && !isValidDoc) {
        setErrorMsg(`File "${file.name}" is not a supported image format (${allowDocuments ? 'JPG, PNG, WEBP, PDF, GeoJSON' : 'JPG, PNG, WEBP'}).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const updated = [...mediaUrls, result].slice(0, maxFiles);
          onChange(updated);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (mediaUrls.length >= maxFiles) {
      setErrorMsg(`Maximum of ${maxFiles} photos allowed.`);
      return;
    }
    onChange([...mediaUrls, urlInput.trim()]);
    setUrlInput('');
    setErrorMsg('');
  };

  const handleRemove = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = mediaUrls[index];
    const rest = mediaUrls.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaUrls.length) return;

    const copy = [...mediaUrls];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">{label}</label>
        <span className="text-xs text-gray-500 font-medium">
          {mediaUrls.length} / {maxFiles} media items
        </span>
      </div>

      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
            : 'border-gray-300 bg-gray-50/60 hover:border-brand-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowDocuments ? 'image/*,application/pdf,.geojson' : 'image/*'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl text-brand-700 mb-2">
          📸
        </div>
        <p className="text-sm font-bold text-gray-800">
          Click to upload files <span className="font-normal text-gray-500">or drag and drop</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PNG, JPG, WEBP {allowDocuments ? 'or PDF reports' : ''} up to 10MB
        </p>
      </div>

      {/* URL Quick Insertion Bar */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste an image URL (https://...)..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddUrl();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="text-xs whitespace-nowrap px-3.5"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || mediaUrls.length >= maxFiles}
        >
          + Add URL
        </Button>
      </div>

      {/* Thumbnail Previews Grid */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {mediaUrls.map((url, idx) => {
            const isCover = idx === 0;
            const isPdf = url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf');

            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
                  isCover ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-gray-200'
                }`}
              >
                {/* Image/Doc Container */}
                <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {isPdf ? (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-red-600">
                      <span className="text-3xl">📄</span>
                      <span className="text-[10px] font-bold mt-1 text-gray-700">PDF Report</span>
                    </div>
                  ) : (
                    <img src={url} alt={`Media ${idx + 1}`} className="h-full w-full object-cover" />
                  )}
                </div>

                {/* Primary Cover Badge */}
                {isCover && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    ⭐ Cover Photo
                  </span>
                )}

                {/* Quick Action Overlay */}
                <div className="p-2 bg-white flex items-center justify-between border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'left')}
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        title="Move left"
                      >
                        ◀
                      </button>
                    )}
                    {idx < mediaUrls.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'right')}
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        title="Move right"
                      >
                        ▶
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="rounded p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                        title="Set as cover photo"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Remove image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
