export function ListingCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white p-0 shadow-sm">
          <div className="aspect-[4/3] w-full animate-shimmer bg-gray-200" />
          <div className="space-y-2.5 p-4">
            <div className="h-5 w-3/4 animate-shimmer rounded-md bg-gray-200" />
            <div className="h-4 w-1/2 animate-shimmer rounded-md bg-gray-200" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 animate-shimmer rounded-full bg-gray-200" />
              <div className="h-6 w-16 animate-shimmer rounded-full bg-gray-200" />
              <div className="h-6 w-16 animate-shimmer rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white p-0 shadow-sm">
          <div className="aspect-video w-full animate-shimmer bg-gray-200" />
          <div className="space-y-2.5 p-4">
            <div className="flex justify-between">
              <div className="h-4 w-20 animate-shimmer rounded bg-gray-200" />
              <div className="h-4 w-16 animate-shimmer rounded bg-gray-200" />
            </div>
            <div className="h-5 w-4/5 animate-shimmer rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-shimmer rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function JobCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 shadow-sm">
          <div className="flex justify-between">
            <div className="h-5 w-2/3 animate-shimmer rounded bg-gray-200" />
            <div className="h-5 w-16 animate-shimmer rounded-full bg-gray-200" />
          </div>
          <div className="h-4 w-1/2 animate-shimmer rounded bg-gray-200" />
          <div className="h-12 w-full animate-shimmer rounded-lg bg-gray-100" />
          <div className="flex justify-between pt-2">
            <div className="h-4 w-24 animate-shimmer rounded bg-gray-200" />
            <div className="h-4 w-20 animate-shimmer rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="p-4 border-b border-gray-100 flex justify-between">
        <div className="h-5 w-32 animate-shimmer rounded bg-gray-200" />
        <div className="h-5 w-24 animate-shimmer rounded bg-gray-200" />
      </div>
      <div className="divide-y divide-gray-100 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 p-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 animate-shimmer rounded bg-gray-200"
                style={{ width: `${Math.max(15, 80 / cols)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="aspect-[4/3] w-full animate-shimmer rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-4 gap-2">
          <div className="aspect-[4/3] w-full animate-shimmer rounded-lg bg-gray-200" />
          <div className="aspect-[4/3] w-full animate-shimmer rounded-lg bg-gray-200" />
          <div className="aspect-[4/3] w-full animate-shimmer rounded-lg bg-gray-200" />
          <div className="aspect-[4/3] w-full animate-shimmer rounded-lg bg-gray-200" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="h-7 w-3/4 animate-shimmer rounded bg-gray-200" />
        <div className="h-8 w-1/3 animate-shimmer rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-shimmer rounded bg-gray-200" />
        <div className="h-24 w-full animate-shimmer rounded-xl bg-gray-100" />
        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="h-5 w-full animate-shimmer rounded bg-gray-200" />
          <div className="h-5 w-full animate-shimmer rounded bg-gray-200" />
        </div>
        <div className="h-12 w-full animate-shimmer rounded-xl bg-brand-200/50 mt-4" />
      </div>
    </div>
  );
}
