import { api } from "@/modules/shared/services/api";

interface CompletedDay {
  date: string;
  completed: boolean;
}

export interface WeekGoalsResponse {
  totalGoal: number;
  completedDays: CompletedDay[];
}

export async function getWeekGoals(): Promise<WeekGoalsResponse> {
  const { data } = await api.get<WeekGoalsResponse>("/dashboard/week-goals");
  return data;
}

export interface WorkoutSummaryResponse {
  lastWorkout: {
    groupLabel: string;
    completedAt: string;
  } | null;
  nextWorkout: {
    groupLabel: string;
  } | null;
}

export async function getWorkoutSummary(): Promise<WorkoutSummaryResponse> {
  const { data } = await api.get<WorkoutSummaryResponse>(
    "/dashboard/workout-summary",
  );
  return data;
}
