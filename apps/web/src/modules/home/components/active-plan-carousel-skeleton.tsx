export function ActivePlanCarouselSkeleton() {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 h-4 w-32 animate-pulse rounded bg-surface-light" />
      <div className="mb-1 h-3 w-20 animate-pulse rounded bg-surface-light" />
      <div className="mt-3 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-36 animate-pulse rounded bg-surface-light" />
            <div className="h-4 w-12 animate-pulse rounded bg-surface-light" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="size-2 animate-pulse rounded-full bg-surface-light"
          />
        ))}
      </div>
    </div>
  );
}
