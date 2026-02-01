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

    // 2. Get groups ordered by display_order
    const { data: groups, error: groupsError } = await this.supabase
      .from("workout_groups")
      .select("id, label, display_order")
      .eq("workout_plan_id", plan.id)
      .order("display_order", { ascending: true });

    if (groupsError || !groups || groups.length === 0) {
      return { lastWorkout: null, nextWorkout: null };
    }

    const groupIds = groups.map((g) => g.id as string);

    // 3. Find the most recent session for any group in this plan
    const { data: lastSession } = await this.supabase
      .from("workout_sessions")
      .select("workout_group_id, finished_at")
      .eq("athlete_id", athleteId)
      .in("workout_group_id", groupIds)
      .order("finished_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastSession) {
      // No sessions yet — next is first group
      return {
        lastWorkout: null,
        nextWorkout: { groupId: groups[0].id, groupLabel: groups[0].label },
      };
    }

    // 4. Find last completed group info
    const lastGroup = groups.find((g) => g.id === lastSession.workout_group_id);
    const lastCompletedIndex = groups.findIndex(
      (g) => g.id === lastSession.workout_group_id,
    );

    // 5. Determine next workout (cyclic)
    const nextIndex = (lastCompletedIndex + 1) % groups.length;

    return {
      lastWorkout: lastGroup
        ? {
            groupLabel: lastGroup.label,
            completedAt: lastSession.finished_at as string,
          }
        : null,
      nextWorkout: {
        groupId: groups[nextIndex].id,
        groupLabel: groups[nextIndex].label,
      },
    };
  }
}
