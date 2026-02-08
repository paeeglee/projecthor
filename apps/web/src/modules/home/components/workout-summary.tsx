import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getWorkoutSummary,
  type WorkoutSummaryResponse,
} from "@/modules/home/services/dashboard.service";
import { Button } from "@/modules/shared/ui/button";
import { WorkoutSummarySkeleton } from "./workout-summary-skeleton";

interface WorkoutSummaryProps {
  onNextGroupResolved?: (groupId: string | null) => void;
}

export function WorkoutSummary({ onNextGroupResolved }: WorkoutSummaryProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["workout-summary"],
    queryFn: getWorkoutSummary,
    placeholderData: {
      lastWorkout: null,
      nextWorkout: null,
    } as WorkoutSummaryResponse,
  });

  useEffect(() => {
    if (data) {
      onNextGroupResolved?.(data.nextWorkout?.groupId ?? null);
    }
  }, [data, onNextGroupResolved]);

  if (isLoading) return <WorkoutSummarySkeleton />;
  if (!data) return null;

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Último Treino
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
            <p className="mt-1 text-base font-semibold text-text-muted">N/D</p>
          )}
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Próximo Treino
          </span>
          {data.nextWorkout ? (
            <p className="mt-1 text-base font-semibold text-white">
              {data.nextWorkout.groupLabel}
            </p>
          ) : (
            <p className="mt-1 text-base font-semibold text-text-muted">
              Sem plano ativo
            </p>
          )}
        </div>
      </div>
      <Button
        className="mt-4 w-full"
        size="default"
        disabled={!data.nextWorkout}
        onClick={() => {
          if (data.nextWorkout) {
            navigate(`/workout/${data.nextWorkout.groupId}`);
          }
        }}
      >
        Iniciar Treino
      </Button>
    </div>
  );
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  return `${diffDays} dias atrás`;
}
