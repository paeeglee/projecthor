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
