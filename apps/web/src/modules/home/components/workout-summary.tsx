import { useEffect, useState } from "react";
import {
  getWorkoutSummary,
  type WorkoutSummaryResponse,
} from "@/modules/home/services/dashboard.service";
import { Button } from "@/modules/shared/ui/button";
import { WorkoutSummarySkeleton } from "./workout-summary-skeleton";

export function WorkoutSummary() {
  const [data, setData] = useState<WorkoutSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkoutSummary()
      .then(setData)
      .catch(() => setData({ lastWorkout: null, nextWorkout: null }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <WorkoutSummarySkeleton />;
  if (!data) return null;

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Last Workout
          </span>
          {data.lastWorkout ? (
            <>
              <p className="mt-1 text-base font-semibold text-white">
                {data.lastWorkout.groupLabel}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {formatRelativeDate(data.lastWorkout.completedAt)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-base font-semibold text-text-muted">N/A</p>
          )}
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Next Workout
          </span>
          {data.nextWorkout ? (
            <p className="mt-1 text-base font-semibold text-white">
              {data.nextWorkout.groupLabel}
            </p>
          ) : (
            <p className="mt-1 text-base font-semibold text-text-muted">
              No active plan
            </p>
          )}
        </div>
      </div>
      <Button className="mt-4 w-full" size="default">
        Start Workout
      </Button>
    </div>
  );
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}
