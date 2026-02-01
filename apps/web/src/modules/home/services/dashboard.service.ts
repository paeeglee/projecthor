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
    groupId: string;
    groupLabel: string;
  } | null;
}

export async function getWorkoutSummary(): Promise<WorkoutSummaryResponse> {
  const { data } = await api.get<WorkoutSummaryResponse>(
    "/dashboard/workout-summary",
  );
  return data;
}

interface ActivePlanExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number | null;
  displayOrder: number;
}

interface ActivePlanGroup {
  id: string;
  label: string;
  displayOrder: number;
  exercises: ActivePlanExercise[];
  targetMuscles: string[];
}

export interface ActivePlanResponse {
  plan: {
    id: string;
    name: string;
  };
  groups: ActivePlanGroup[];
}

export async function getActivePlan(): Promise<ActivePlanResponse> {
  const { data } = await api.get<ActivePlanResponse>("/workout/plans/active");
  return data;
}
