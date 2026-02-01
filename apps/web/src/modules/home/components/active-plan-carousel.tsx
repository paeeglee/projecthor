import { useCallback, useEffect, useRef, useState } from "react";
import {
  getActivePlan,
  type ActivePlanResponse,
} from "@/modules/home/services/dashboard.service";
import { ActivePlanCarouselSkeleton } from "./active-plan-carousel-skeleton";

export function ActivePlanCarousel() {
  const [data, setData] = useState<ActivePlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getActivePlan()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }, []);

  if (loading) return <ActivePlanCarouselSkeleton />;
  if (error || !data) {
    return (
      <div className="rounded-xl bg-surface p-4">
        <p className="text-sm text-text-muted">No active plan</p>
      </div>
    );
  }

  const { plan, groups } = data;

  return (
    <div className="rounded-xl bg-surface pt-4 pb-4">
      <h2 className="mb-3 text-sm font-semibold text-white px-4">
        {plan.name}
      </h2>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {groups.map((group) => (
          <div
            key={group.id}
            className="min-w-full shrink-0 snap-start overflow-hidden px-4"
          >
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              {group.label}
            </span>
            {group.targetMuscles.length > 0 && (
              <p className="mt-0.5 text-[11px] text-text-muted">
                {group.targetMuscles.join(" · ")}
              </p>
            )}
            <ul className="mt-2 space-y-2">
              {group.exercises.map((exercise) => (
                <li
                  key={exercise.exerciseId}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-white">
                    {exercise.exerciseName}
                  </span>
                  <span className="text-sm font-medium text-text-muted">
                    {exercise.sets}x{exercise.reps}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {groups.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {groups.map((group, i) => (
            <div
              key={group.id}
              className={`size-2 rounded-full transition-colors ${
                i === activeIndex ? "bg-primary" : "bg-text-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
