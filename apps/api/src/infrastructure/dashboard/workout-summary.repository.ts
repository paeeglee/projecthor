import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IWorkoutSummaryRepository,
  WorkoutSummaryData,
} from "../../domain/dashboard/workout-summary.repository";

export class WorkoutSummaryRepository implements IWorkoutSummaryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getWorkoutSummary(athleteId: string): Promise<WorkoutSummaryData> {
    // 1. Find active plan
    const { data: plan, error: planError } = await this.supabase
      .from("workout_plans")
      .select("id")
      .eq("athlete_id", athleteId)
      .eq("active", true)
      .single();

    if (planError || !plan) {
      return { lastWorkout: null, nextWorkout: null };
    }

    // 2. Get groups ordered by display_order, with their exercises
    const { data: groups, error: groupsError } = await this.supabase
      .from("workout_groups")
      .select("id, label, display_order, workout_exercises(id)")
      .eq("workout_plan_id", plan.id)
      .order("display_order", { ascending: true });

    if (groupsError || !groups || groups.length === 0) {
      return { lastWorkout: null, nextWorkout: null };
    }

    // 3. For each group, find if all exercises are logged and when
    let lastCompletedGroup: { label: string; completedAt: string } | null =
      null;
    let lastCompletedIndex = -1;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const exercises =
        (group.workout_exercises as Array<{ id: string }>) ?? [];

      if (exercises.length === 0) continue;

      const exerciseIds = exercises.map((e) => e.id);

      // Get the latest log for each exercise in this group
      const { data: logs } = await this.supabase
        .from("workout_logs")
        .select("workout_exercise_id, completed_at")
        .eq("athlete_id", athleteId)
        .in("workout_exercise_id", exerciseIds)
        .order("completed_at", { ascending: false });

      if (!logs || logs.length === 0) continue;

      // Check if all exercises have at least one log
      const loggedExerciseIds = new Set(
        logs.map((l) => l.workout_exercise_id as string),
      );
      const allLogged = exerciseIds.every((id) => loggedExerciseIds.has(id));

      if (!allLogged) continue;

      // Latest completion = the most recent log among this group's exercises
      const latestLog = logs[0].completed_at as string;

      if (
        !lastCompletedGroup ||
        new Date(latestLog) > new Date(lastCompletedGroup.completedAt)
      ) {
        lastCompletedGroup = {
          label: group.label,
          completedAt: latestLog,
        };
        lastCompletedIndex = i;
      }
    }

    // 4. Determine next workout (cyclic rotation)
    let nextWorkout: { groupId: string; groupLabel: string } | null = null;

    if (lastCompletedIndex === -1) {
      // No workout done yet — next is the first group
      nextWorkout = { groupId: groups[0].id, groupLabel: groups[0].label };
    } else {
      const nextIndex = (lastCompletedIndex + 1) % groups.length;
      nextWorkout = {
        groupId: groups[nextIndex].id,
        groupLabel: groups[nextIndex].label,
      };
    }

    return {
      lastWorkout: lastCompletedGroup
        ? {
            groupLabel: lastCompletedGroup.label,
            completedAt: lastCompletedGroup.completedAt,
          }
        : null,
      nextWorkout,
    };
  }
}
