import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import {
  getWeekGoals,
  type WeekGoalsResponse,
} from "@/modules/home/services/dashboard.service";
import { WeekGoalsSkeleton } from "./week-goals-skeleton";

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function WeekGoals() {
  const { data, isLoading } = useQuery({
    queryKey: ["week-goals"],
    queryFn: getWeekGoals,
    placeholderData: {
      totalGoal: 0,
      completedDays: buildEmptyWeek(),
    } as WeekGoalsResponse,
  });

  if (isLoading) return <WeekGoalsSkeleton />;
  if (!data) return null;

  const completedCount = data.completedDays.filter((d) => d.completed).length;
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
          Meta da Semana
        </span>
        <span className="text-xs font-semibold text-text-muted">
          {completedCount}/{data.totalGoal}
        </span>
      </div>
      <div className="flex justify-between">
        {data.completedDays.map((day, i) => {
          const dayDate = new Date(day.date + "T00:00:00");
          const dayOfMonth = dayDate.getDate();
          const isToday = day.date === todayStr;

          return (
            <div key={day.date} className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-text-muted">
                {DAY_LABELS[i]}
              </span>
              {day.completed ? (
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-b from-red-400 to-red-600">
                  <Check className="size-4 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${
                    isToday
                      ? "bg-primary text-text-on-primary font-bold"
                      : "bg-surface-light text-text-muted"
                  }`}
                >
                  <span className="text-sm">{dayOfMonth}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildEmptyWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return { date: d.toISOString().split("T")[0], completed: false };
  });
}
