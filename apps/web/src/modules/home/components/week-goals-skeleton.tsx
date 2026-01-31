export function WeekGoalsSkeleton() {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-surface-light" />
        <div className="h-4 w-8 animate-pulse rounded bg-surface-light" />
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-3 w-6 animate-pulse rounded bg-surface-light" />
            <div className="size-10 animate-pulse rounded-full bg-surface-light" />
          </div>
        ))}
      </div>
    </div>
  );
}
