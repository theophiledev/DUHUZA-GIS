import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Inbox,
  Lock,
  Sparkles,
  MapPin,
  Eye,
} from 'lucide-react';

export type StatusRailType =
  | 'published'
  | 'approved'
  | 'pending'
  | 'pending-review'
  | 'rejected'
  | 'suspended'
  | 'requested'
  | 'assigned'
  | 'completed'
  | 'in-progress'
  | 'draft'
  | 'info'
  | 'neutral';

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-[#0F766E]" />
      {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-red-200 bg-red-50/90 p-4 text-red-900 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center text-xs font-bold text-red-700 underline hover:text-red-900"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, message, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white/80 p-8 sm:p-12 text-center text-gray-600 shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#0F766E] shadow-sm mb-4">
        {icon || <Inbox className="h-7 w-7 stroke-[1.5]" />}
      </div>
      {title && <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 mb-1">{title}</h3>}
      <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction} className="shadow-sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  const config: Record<string, { label: string; bg: string; text: string; border: string; icon: ReactNode }> = {
    PUBLISHED: {
      label: 'Published',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
    },
    APPROVED: {
      label: 'Approved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
    },
    ACTIVE: {
      label: 'Active',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
    },
    PENDING_REVIEW: {
      label: 'Pending Review',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      icon: <Clock className="h-3 w-3 text-amber-700" />,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      icon: <Clock className="h-3 w-3 text-amber-700" />,
    },
    REQUESTED: {
      label: 'Requested',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      icon: <Clock className="h-3 w-3 text-blue-700" />,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-sky-50',
      text: 'text-sky-900',
      border: 'border-sky-200',
      icon: <Sparkles className="h-3 w-3 text-sky-700" />,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-red-50',
      text: 'text-red-900',
      border: 'border-red-200',
      icon: <AlertTriangle className="h-3 w-3 text-red-600" />,
    },
    SUSPENDED: {
      label: 'Suspended',
      bg: 'bg-red-50',
      text: 'text-red-900',
      border: 'border-red-200',
      icon: <XCircle className="h-3 w-3 text-red-600" />,
    },
    DRAFT: {
      label: 'Draft',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />,
    },
  };

  const item = config[norm] || {
    label: norm.replace(/_/g, ' '),
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${item.bg} ${item.text} ${item.border}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#16241F]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#5B6B66]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = '',
  statusRail,
}: {
  children: ReactNode;
  className?: string;
  statusRail?: StatusRailType;
}) {
  const railClass = statusRail ? `status-rail status-rail-${statusRail.toLowerCase().replace(/_/g, '-')}` : '';
  return (
    <div
      className={`rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${railClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'custom';
}) {
  const variants = {
    primary: 'bg-[#0F766E] text-white hover:bg-[#0B5750] shadow-sm active:translate-y-px',
    secondary: 'border border-[#E2E8E6] bg-white text-[#16241F] hover:bg-gray-50 active:bg-gray-100',
    danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200',
    ghost: 'text-[#0F766E] hover:bg-teal-50 active:bg-teal-100',
    accent: 'bg-[#F59E0B] text-slate-950 font-bold hover:bg-amber-500 shadow-sm',
    custom: '',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none min-h-[38px] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  className = '',
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">{label}</span>}
      <input
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-gray-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100 ${
          error ? 'border-red-300 ring-2 ring-red-100' : 'border-[#E2E8E6]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium" role="alert">{error}</p>}
    </label>
  );
}

export function Textarea({
  label,
  className = '',
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">{label}</span>}
      <textarea
        className={`w-full rounded-lg border bg-white p-3 text-sm text-gray-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100 ${
          error ? 'border-red-300 ring-2 ring-red-100' : 'border-[#E2E8E6]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium" role="alert">{error}</p>}
    </label>
  );
}

export function Select({
  label,
  children,
  className = '',
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">{label}</span>}
      <select
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100 ${
          error ? 'border-red-300 ring-2 ring-red-100' : 'border-[#E2E8E6]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600 font-medium" role="alert">{error}</p>}
    </label>
  );
}

/**
 * 2.1 & 6. Microcopy: Always formats 85,000,000 RWF with proper comma grouping
 */
export function formatPrice(price: number | string | null | undefined, currency = 'RWF') {
  if (price == null || price === '') return '—';
  const n = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(n)) return '—';
  return `${Math.round(n).toLocaleString('en-US')} ${currency}`;
}

/**
 * 4.3 & 5. ReviewCard (Manager & Agent Queue Signature Card)
 * Signature 4px colored status rail on left side
 */
export interface ReviewCardProps {
  id: string;
  title: string;
  status: string;
  category?: string;
  location?: string;
  price?: number | string | null;
  currency?: string;
  description?: string;
  ownerName?: string;
  ownerPhone?: string;
  internalNotes?: string;
  submitterInfo?: ReactNode;
  tags?: string[];
  imageUrl?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onInspect?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  inspectLabel?: string;
  actionLoading?: boolean;
  extraActions?: ReactNode;
}

export function ReviewCard({
  id: _id,
  title,
  status,
  category,
  location,
  price,
  currency = 'RWF',
  description,
  ownerName,
  ownerPhone,
  internalNotes,
  submitterInfo,
  tags,
  imageUrl,
  onApprove,
  onReject,
  onInspect,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
  inspectLabel = 'Inspect',
  actionLoading = false,
  extraActions,
}: ReviewCardProps) {
  const normStatus = (status || '').toLowerCase().replace(/_/g, '-');
  const railClass = `status-rail status-rail-${normStatus}`;

  return (
    <div
      className={`group rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${railClass}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                {category}
              </span>
            )}
            <StatusBadge status={status} />
            {tags?.map((t, idx) => (
              <span key={idx} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                {t}
              </span>
            ))}
          </div>

          <div>
            <h3
              onClick={onInspect}
              className={`font-heading text-base sm:text-lg font-bold text-[#16241F] line-clamp-1 ${
                onInspect ? 'cursor-pointer hover:text-[#0F766E] transition' : ''
              }`}
            >
              {title}
            </h3>
            {location && <p className="inline-flex items-center gap-1 text-xs text-[#5B6B66] mt-0.5"><MapPin size={14} strokeWidth={1.75} />{location}</p>}
          </div>
        </div>

        {price !== undefined && price !== null && (
          <div className="text-left sm:text-right shrink-0">
            <span className="font-heading text-lg sm:text-xl font-extrabold text-[#0F766E]">
              {formatPrice(price, currency)}
            </span>
          </div>
        )}
      </div>

      {imageUrl && (
        <div
          onClick={onInspect}
          className={`mt-3 overflow-hidden rounded-lg bg-gray-100 max-h-48 relative ${
            onInspect ? 'cursor-pointer' : ''
          }`}
        >
          <img src={imageUrl} alt={title} className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {onInspect && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-xs">
              <span className="inline-flex items-center gap-1"><Eye size={14} strokeWidth={2} />View Full Details</span>
            </div>
          )}
        </div>
      )}

      {description && (
        <p className="mt-3 text-xs leading-relaxed text-gray-600 line-clamp-2 bg-gray-50/60 p-2.5 rounded-lg border border-gray-100">
          {description}
        </p>
      )}

      {/* Private Owner Box (Manager/Admin Eyes Only) */}
      {(ownerName || ownerPhone || internalNotes) && (
        <div className="mt-3 rounded-lg border border-amber-200/70 bg-amber-50/60 p-2.5 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Lock className="h-3.5 w-3.5 text-amber-800 shrink-0" />
            <span>Confidential Owner Record:</span>
            <span className="font-semibold text-amber-950">{ownerName || 'Confidential'}</span>
          </div>
          {ownerPhone && (
            <div className="text-[11px] text-amber-900">
              Phone: <span className="font-mono-data font-semibold">{ownerPhone}</span>
            </div>
          )}
          {internalNotes && (
            <div className="text-[11px] text-amber-900 italic">
              Note: {internalNotes}
            </div>
          )}
        </div>
      )}

      {/* Bottom Bar & Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 flex-1 min-w-[200px]">
          {submitterInfo && <div>{submitterInfo}</div>}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {extraActions}
          {onInspect && (
            <Button
              variant="secondary"
              onClick={onInspect}
              disabled={actionLoading}
              className="text-xs text-[#0F766E] border-teal-200 hover:bg-teal-50 min-h-[34px] px-3 font-semibold"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              {inspectLabel}
            </Button>
          )}
          {onReject && (
            <Button
              variant="secondary"
              onClick={onReject}
              disabled={actionLoading}
              className="text-xs text-red-700 hover:bg-red-50 border-red-200 min-h-[34px] px-3.5"
            >
              {rejectLabel}
            </Button>
          )}
          {onApprove && (
            <Button
              variant="primary"
              onClick={onApprove}
              disabled={actionLoading}
              className="text-xs min-h-[34px] px-4 font-bold"
            >
              ✓ {approveLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 5. ConfirmDialog Component
 * Supports mandatory rejection reason comments and critical confirmations
 */
export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  requireComment?: boolean;
  commentLabel?: string;
  commentPlaceholder?: string;
  minCommentLength?: number;
  isLoading?: boolean;
  onConfirm: (comment?: string) => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  requireComment = false,
  commentLabel = 'Mandatory reason / feedback for submitter:',
  commentPlaceholder = 'Explain why this action is being taken so the user can rectify...',
  minCommentLength = 3,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireComment) {
      if (!comment.trim() || comment.trim().length < minCommentLength) {
        setError(`A specific reason is required (minimum ${minCommentLength} characters).`);
        return;
      }
    }
    onConfirm(comment.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.15)] space-y-4">
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            {variant === 'danger' ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-[#0F766E] shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            <h3 id="dialog-title" className="font-heading text-lg font-bold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {message && <p className="text-sm text-gray-600 leading-relaxed">{message}</p>}

        {requireComment && (
          <div className="space-y-1.5" role="region" aria-live="polite">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {commentLabel}
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError('');
              }}
              placeholder={commentPlaceholder}
              rows={4}
              className={`w-full rounded-xl border p-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100 ${
                error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'
              }`}
              required
            />
            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
            <p className="text-[11px] text-gray-500">
              This note is saved to the audit trail and displayed directly to the creator.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isLoading || (requireComment && comment.trim().length < minCommentLength)}
            className="min-w-[100px]"
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * 4.2 & 5. Responsive DataTable Component
 * Automatically displays full <table> on screens ≥768px and converts to <CardList> on screens <768px.
 */
export interface DataTableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  renderCard?: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  statusRailExtractor?: (item: T) => StatusRailType | undefined;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  renderCard,
  emptyMessage = 'No records found.',
  emptyActionLabel,
  onEmptyAction,
  statusRailExtractor,
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} actionLabel={emptyActionLabel} onAction={onEmptyAction} />;
  }

  return (
    <div className="space-y-4">
      {/* Desktop / Tablet View (≥768px): Structured Data Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-[#E2E8E6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#16241F]">
            <thead className="border-b border-[#E2E8E6] bg-gray-50/80 text-xs font-bold uppercase tracking-wider text-[#5B6B66]">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={`px-5 py-3.5 ${col.headerClassName || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E6]">
              {data.map((item, rowIdx) => {
                const rail = statusRailExtractor ? statusRailExtractor(item) : undefined;
                const railClass = rail ? `status-rail status-rail-${rail}` : '';

                return (
                  <tr
                    key={keyExtractor(item)}
                    className={`transition-colors hover:bg-teal-50/20 ${railClass}`}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-5 py-3.5 ${col.className || ''}`}>
                        {col.render
                          ? col.render(item, rowIdx)
                          : col.accessor
                          ? String(item[col.accessor] ?? '—')
                          : '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View (<768px): Card Transformation (Section 4.2) */}
      <div className="md:hidden space-y-3">
        {data.map((item, idx) => {
          if (renderCard) {
            return <React.Fragment key={keyExtractor(item)}>{renderCard(item, idx)}</React.Fragment>;
          }

          const rail = statusRailExtractor ? statusRailExtractor(item) : undefined;
          const railClass = rail ? `status-rail status-rail-${rail}` : '';

          return (
            <div
              key={keyExtractor(item)}
              className={`rounded-xl border border-[#E2E8E6] bg-white p-4 shadow-xs space-y-2.5 ${railClass}`}
            >
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex items-start justify-between gap-2 text-xs">
                  <span className="font-bold text-gray-500 uppercase tracking-wider shrink-0">
                    {col.header}:
                  </span>
                  <div className="text-right text-gray-900 font-medium">
                    {col.render
                      ? col.render(item, idx)
                      : col.accessor
                      ? String(item[col.accessor] ?? '—')
                      : '—'}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 5. FormPanel Component with Accessible Error Regions
 */
export function FormPanel({
  title,
  subtitle,
  children,
  error,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[#E2E8E6] bg-white p-6 shadow-sm space-y-5 ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-gray-100 pb-4">
          {title && <h2 className="font-heading text-lg font-bold text-gray-900">{title}</h2>}
          {subtitle && <p className="text-xs text-[#5B6B66] mt-0.5">{subtitle}</p>}
        </div>
      )}

      {error && (
        <div role="region" aria-live="polite">
          <ErrorAlert message={error} />
        </div>
      )}

      <div className="space-y-4">{children}</div>
    </div>
  );
}
