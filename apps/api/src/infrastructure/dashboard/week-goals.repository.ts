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

    // 2. Get groups to determine total goal
    const { data: groups, error: groupsError } = await this.supabase
      .from("workout_groups")
      .select("id")
      .eq("workout_plan_id", plan.id);

    if (groupsError || !groups || groups.length === 0) {
      return this.emptyWeek(weekStart);
    }

    const totalGoal = groups.length;
    const groupIds = groups.map((g) => g.id as string);

    // 3. Get all sessions for this athlete in the week range
    const { data: sessions, error: sessionsError } = await this.supabase
      .from("workout_sessions")
      .select("finished_at")
      .eq("athlete_id", athleteId)
      .in("workout_group_id", groupIds)
      .gte("finished_at", weekStart.toISOString())
      .lte("finished_at", weekEnd.toISOString());

    if (sessionsError) {
      return this.emptyWeek(weekStart);
    }

    // 4. Build set of dates that have at least one session
    const sessionDates = new Set<string>();
    for (const session of sessions ?? []) {
      const dateStr = new Date(session.finished_at as string)
        .toISOString()
        .split("T")[0];
      sessionDates.add(dateStr);
    }

    // 5. Build the 7-day array
    const completedDays = [];
    const current = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const dateStr = current.toISOString().split("T")[0];
      completedDays.push({
        date: dateStr,
        completed: sessionDates.has(dateStr),
      });
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
