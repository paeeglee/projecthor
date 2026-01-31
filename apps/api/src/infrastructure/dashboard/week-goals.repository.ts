import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IWeekGoalsRepository,
  WeekGoalsData,
} from "../../domain/dashboard/week-goals.repository";

export class WeekGoalsRepository implements IWeekGoalsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getWeekGoals(
    athleteId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<WeekGoalsData> {
    // 1. Find active plan
    const { data: plan, error: planError } = await this.supabase
      .from("workout_plans")
      .select("id")
      .eq("athlete_id", athleteId)
      .eq("active", true)
      .single();

    if (planError || !plan) {
      return this.emptyWeek(weekStart);
    }

    // 2. Get groups with their exercises
    const { data: groups, error: groupsError } = await this.supabase
      .from("workout_groups")
      .select("id, workout_exercises(id)")
      .eq("workout_plan_id", plan.id);

    if (groupsError || !groups || groups.length === 0) {
      return this.emptyWeek(weekStart);
    }

    const totalGoal = groups.length;

    // 3. Get all workout logs for this athlete in the week range
    const exerciseIds = groups.flatMap((g: Record<string, unknown>) =>
      ((g.workout_exercises as Array<{ id: string }>) ?? []).map((e) => e.id),
    );

    if (exerciseIds.length === 0) {
      return this.emptyWeek(weekStart);
    }

    const { data: logs, error: logsError } = await this.supabase
      .from("workout_logs")
      .select("workout_exercise_id, completed_at")
      .eq("athlete_id", athleteId)
      .in("workout_exercise_id", exerciseIds)
      .gte("completed_at", weekStart.toISOString())
      .lte("completed_at", weekEnd.toISOString());

    if (logsError) {
      return this.emptyWeek(weekStart);
    }

    // 4. Build a map: date string -> set of exercise IDs logged
    const logsByDate = new Map<string, Set<string>>();
    for (const log of logs ?? []) {
      const dateStr = new Date(log.completed_at as string)
        .toISOString()
        .split("T")[0];
      if (!logsByDate.has(dateStr)) {
        logsByDate.set(dateStr, new Set());
      }
      logsByDate.get(dateStr)!.add(log.workout_exercise_id as string);
    }

    // 5. For each day, check if any group is fully completed
    const completedDays = [];
    const current = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const dateStr = current.toISOString().split("T")[0];
      const loggedExercises = logsByDate.get(dateStr) ?? new Set();

      const completed = groups.some((group: Record<string, unknown>) => {
        const exercises =
          (group.workout_exercises as Array<{ id: string }>) ?? [];
        if (exercises.length === 0) return false;
        return exercises.every((e) => loggedExercises.has(e.id));
      });

      completedDays.push({ date: dateStr, completed });
      current.setDate(current.getDate() + 1);
    }

    return { totalGoal, completedDays };
  }

  private emptyWeek(weekStart: Date): WeekGoalsData {
    const completedDays = [];
    const current = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      completedDays.push({
        date: current.toISOString().split("T")[0],
        completed: false,
      });
      current.setDate(current.getDate() + 1);
    }
    return { totalGoal: 0, completedDays };
  }
}
