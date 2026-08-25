export function ListingCardSkeleton() {
  return (
    <div className="skeleton-pulse overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-6 w-14 rounded-full bg-gray-200" />
          <div className="h-6 w-14 rounded-full bg-gray-200" />
          <div className="h-6 w-14 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function ListingCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="skeleton-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="h-5 w-2/3 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />
      <div className="mt-4 h-12 w-full rounded bg-gray-200" />
    </div>
  );
}
