import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { getActivePlan } from "@/modules/home/services/dashboard.service";
import { ActivePlanCarouselSkeleton } from "./active-plan-carousel-skeleton";

interface ActivePlanCarouselProps {
  initialGroupId?: string | null;
}

export function ActivePlanCarousel({
  initialGroupId,
}: ActivePlanCarouselProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["active-plan"],
    queryFn: getActivePlan,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !initialGroupId) return;
    const index = data.groups.findIndex((g) => g.id === initialGroupId);
    if (index <= 0) return;
    setActiveIndex(index);
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: index * el.clientWidth, behavior: "instant" });
    }
  }, [data, initialGroupId]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }, []);

  if (isLoading) return <ActivePlanCarouselSkeleton />;
  if (isError || !data) {
    return (
      <div className="rounded-xl bg-surface p-4">
        <p className="text-sm text-text-muted">Sem plano ativo</p>
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
            className="flex min-w-full shrink-0 snap-start flex-col overflow-hidden px-4"
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
            <div className="mt-auto pt-3">
              <Link
                to={`/workout/${group.id}/preview`}
                className="block w-full rounded-md border border-border py-2 text-center text-sm font-medium text-text hover:bg-surface-light transition-colors"
              >
                Ver Treino
              </Link>
            </div>
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
