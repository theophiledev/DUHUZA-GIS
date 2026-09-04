import { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  ExternalLink,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button, StatusBadge, formatPrice } from './ui';
import { SmartImage } from './SmartImage';
import type { SubmitterProfile, LanguageCode } from '../types';

export interface ManagerItemDetailData {
  id: string;
  type: 'listing' | 'market' | 'service' | 'job' | 'gis';
  typeLabel: string;
  title: string;
  status: string;
  category?: string;
  listingType?: string;
  price?: number | string | null;
  currency?: string;
  description?: string;
  location?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  publicLat?: number | null;
  publicLng?: number | null;
  privateLat?: number | null;
  privateLng?: number | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  internalNotes?: string | null;
  createdAt?: string;
  media?: { url: string; type?: string }[];
  attributes?: Record<string, string> | { key: string; value: string }[];
  translations?: { languageCode: LanguageCode; title: string; description: string }[];
  submitter?: SubmitterProfile | null;
  approvalComment?: string | null;
  // Extra fields for specific verticals
  rateInfo?: string | null;
  coverageDistrict?: string | null;
  coverageSector?: string | null;
  salaryRange?: string | null;
  deadline?: string | null;
  purpose?: string | null;
  reportUrl?: string | null;
  assignedAgent?: SubmitterProfile | null;
}

interface ManagerItemDetailModalProps {
  isOpen: boolean;
  item: ManagerItemDetailData | null;
  onClose: () => void;
  onApprove: (id: string, comment?: string) => Promise<void> | void;
  onReject: (id: string, comment: string) => Promise<void> | void;
  actionLoading?: boolean;
}

export function ManagerItemDetailModal({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
  actionLoading = false,
}: ManagerItemDetailModalProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('RW');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveMediaIndex(0);
      setFeedbackComment('');
      setShowRejectBox(false);
      setRejectError('');
      if (item?.translations && item.translations.length > 0) {
        setSelectedLang(item.translations[0].languageCode);
      }
    }
  }, [isOpen, item]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const photos = item.media || [];
  const currentPhoto = photos[activeMediaIndex]?.url;

  // Multi-language translation resolution
  const currentTranslation = item.translations?.find((t) => t.languageCode === selectedLang);
  const displayTitle = currentTranslation?.title || item.title;
  const displayDesc = currentTranslation?.description || item.description;

  // Normalized attributes
  const attrList: { key: string; value: string }[] = [];
  if (item.attributes) {
    if (Array.isArray(item.attributes)) {
      attrList.push(...item.attributes);
    } else {
      Object.entries(item.attributes).forEach(([key, value]) => {
        attrList.push({ key, value: String(value) });
      });
    }
  }

  const handleApproveClick = () => {
    onApprove(item.id, feedbackComment.trim() || undefined);
  };

  const handleRejectClick = () => {
    if (!feedbackComment.trim() || feedbackComment.trim().length < 3) {
      setRejectError('Please write a feedback explanation for the submitter before rejecting.');
      setShowRejectBox(true);
      return;
    }
    onReject(item.id, feedbackComment.trim());
  };

  const lat = item.privateLat || item.publicLat;
  const lng = item.privateLng || item.publicLng;
  const googleMapsUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  const submitterPhoneClean = item.submitter?.phone ? item.submitter.phone.replace(/[^0-9+]/g, '') : '';
  const waUrl = submitterPhoneClean
    ? `https://wa.me/${submitterPhoneClean.startsWith('+') ? submitterPhoneClean.slice(1) : submitterPhoneClean}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 via-teal-50/30 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#0F766E] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
              {item.typeLabel}
            </span>
            <StatusBadge status={item.status} />
            {item.createdAt && (
              <span className="text-xs text-gray-500 hidden sm:inline-flex items-center gap-1 font-mono-data">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                Submitted: {new Date(item.createdAt).toLocaleDateString()} at{' '}
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            title="Close modal (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL CONTENT BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. SUBMITTER IDENTITY CARD (Clear contact info of who sent the item) */}
          <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 p-4 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F766E] text-white shadow-sm font-bold text-lg">
                  {item.submitter?.name ? item.submitter.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-base font-bold text-gray-900">
                      {item.submitter?.name || 'Anonymous / Unassigned'}
                    </h4>
                    <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                      {item.submitter?.role || 'CLIENT'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Item Submitter &amp; Primary Account Holder
                  </p>
                </div>
              </div>

              {/* Action Contact Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {item.submitter?.phone && (
                  <>
                    <a
                      href={`tel:${item.submitter.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:border-[#0F766E] hover:text-[#0F766E] transition"
                    >
                      <Phone className="h-3.5 w-3.5 text-teal-600" />
                      <span>{item.submitter.phone}</span>
                    </a>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-100 transition"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>WhatsApp Chat</span>
                      </a>
                    )}
                  </>
                )}

                {item.submitter?.email && (
                  <a
                    href={`mailto:${item.submitter.email}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:border-[#0F766E] hover:text-[#0F766E] transition"
                  >
                    <Mail className="h-3.5 w-3.5 text-teal-600" />
                    <span>{item.submitter.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 2. MEDIA GALLERY & PREVIEW */}
          {photos.length > 0 && (
            <div className="space-y-2.5">
              <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl bg-gray-900 border border-gray-200 group">
                <SmartImage
                  src={currentPhoto}
                  alt={displayTitle}
                  fallbackType="property"
                  className="h-full w-full object-contain sm:object-cover transition duration-300"
                  containerClassName="h-full w-full"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveMediaIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                      title="Next Photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                      {activeMediaIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        activeMediaIndex === idx
                          ? 'border-[#0F766E] shadow-sm ring-2 ring-[#0F766E]/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. CORE ITEM SPECIFICATIONS */}
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* Title & Pricing Box */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Item Title &amp; Valuation
              </span>
              <h3 className="font-heading text-xl font-bold text-gray-900">{displayTitle}</h3>
              
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {item.price !== undefined && item.price !== null && (
                  <span className="font-heading text-2xl font-extrabold text-[#0F766E]">
                    {formatPrice(item.price, item.currency || 'RWF')}
                  </span>
                )}
                {item.category && (
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {item.category} {item.listingType ? `· ${item.listingType}` : ''}
                  </span>
                )}
                {item.rateInfo && (
                  <span className="rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    Rate: {item.rateInfo}
                  </span>
                )}
                {item.salaryRange && (
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-900">
                    Salary: {item.salaryRange}
                  </span>
                )}
              </div>
            </div>

            {/* Location & GPS Box */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Location &amp; Coordinates
              </span>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#0F766E] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.district || item.coverageDistrict || 'Rwanda'}
                    {item.sector ? ` · ${item.sector}` : ''}
                    {item.cell ? ` · ${item.cell}` : ''}
                    {item.village ? ` · ${item.village}` : ''}
                  </p>
                  {lat && lng && (
                    <p className="text-xs font-mono-data text-gray-500 mt-1">
                      GPS: {lat}, {lng}
                    </p>
                  )}
                </div>
              </div>

              {googleMapsUrl && (
                <div className="pt-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
                  >
                    <span>Open in Google Maps / Satellite</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* 4. DESCRIPTION & TRANSLATIONS */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Detailed Description
              </span>

              {/* Language Selector if multiple translations available */}
              {item.translations && item.translations.length > 1 && (
                <div className="flex gap-1">
                  {item.translations.map((t) => (
                    <button
                      key={t.languageCode}
                      onClick={() => setSelectedLang(t.languageCode)}
                      className={`rounded px-2 py-0.5 text-xs font-bold uppercase transition ${
                        selectedLang === t.languageCode
                          ? 'bg-[#0F766E] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t.languageCode}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {displayDesc || 'No written description provided by the submitter.'}
            </p>
          </div>

          {/* 5. ATTRIBUTES GRID */}
          {attrList.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Technical Specifications &amp; Attributes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {attrList.map((attr, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-2.5">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">{attr.key.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-bold text-gray-800">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. CONFIDENTIAL OWNER & INTERNAL RECORDS (Manager eyes only) */}
          {(item.ownerName || item.ownerPhone || item.internalNotes) && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-2 text-amber-950">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                <Lock className="h-4 w-4 text-amber-800" />
                <span>Confidential Owner Records (Private to Platform Management)</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-amber-800 font-semibold">Owner Name:</span>{' '}
                  <span className="font-bold">{item.ownerName || '—'}</span>
                </div>
                <div>
                  <span className="text-amber-800 font-semibold">Owner Phone:</span>{' '}
                  <span className="font-bold font-mono-data">{item.ownerPhone || '—'}</span>
                </div>
              </div>
              {item.internalNotes && (
                <div className="text-xs text-amber-900 border-t border-amber-200/80 pt-2 italic">
                  <strong>Internal Agent/Staff Note:</strong> {item.internalNotes}
                </div>
              )}
            </div>
          )}

          {/* 7. MODERATION FEEDBACK INPUT (Used for both approval feedback and mandatory rejection reason) */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
                <span>Manager Review Feedback (Sent to Submitter via Email):</span>
              </label>
              {showRejectBox && (
                <span className="text-xs font-bold text-red-600 animate-pulse">
                  * Mandatory for rejection
                </span>
              )}
            </div>

            <textarea
              value={feedbackComment}
              onChange={(e) => {
                setFeedbackComment(e.target.value);
                if (rejectError) setRejectError('');
              }}
              rows={3}
              placeholder="E.g., Approved with verified documentation, or explain what corrections are needed..."
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0F766E] focus:outline-none shadow-xs"
            />

            {rejectError && (
              <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" />
                {rejectError}
              </p>
            )}
          </div>

        </div>

        {/* MODAL ACTION FOOTER */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={actionLoading} className="text-xs">
            Close
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={handleRejectClick}
              disabled={actionLoading}
              className="text-xs font-bold text-red-700 hover:bg-red-50 border-red-200 px-4 min-h-[36px]"
            >
              <XCircle className="h-4 w-4 mr-1.5 text-red-600" />
              Reject Submission
            </Button>

            <Button
              variant="primary"
              onClick={handleApproveClick}
              disabled={actionLoading}
              className="text-xs font-bold px-5 min-h-[36px] bg-[#0F766E] hover:bg-[#0d6962]"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-white" />
              {actionLoading ? 'Processing...' : '✓ Approve & Publish Live'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
