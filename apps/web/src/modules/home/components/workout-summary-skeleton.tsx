export function WorkoutSummarySkeleton() {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-surface-light" />
          <div className="h-5 w-24 animate-pulse rounded bg-surface-light" />
          <div className="h-3 w-16 animate-pulse rounded bg-surface-light" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-surface-light" />
          <div className="h-5 w-24 animate-pulse rounded bg-surface-light" />
        </div>
      </div>
    </div>
  );
}
