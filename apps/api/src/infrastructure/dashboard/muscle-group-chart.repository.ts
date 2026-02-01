import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IMuscleGroupChartRepository,
  MuscleGroupChartEntry,
} from "../../domain/dashboard/muscle-group-chart.repository";

export class MuscleGroupChartRepository implements IMuscleGroupChartRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getMuscleGroupChart(
    athleteId: string,
    since: Date,
  ): Promise<MuscleGroupChartEntry[]> {
    // 1. Find active plan
    const { data: plan, error: planError } = await this.supabase
      .from("workout_plans")
      .select("id")
      .eq("athlete_id", athleteId)
      .eq("active", true)
      .single();

    if (planError || !plan) return [];

    // 2. Get groups for this plan
    const { data: groups, error: groupsError } = await this.supabase
      .from("workout_groups")
      .select("id")
      .eq("workout_plan_id", plan.id);

    if (groupsError || !groups || groups.length === 0) return [];

    const groupIds = groups.map((g) => g.id as string);

    // 3. Get all workout exercises for these groups
    const { data: workoutExercises, error: weError } = await this.supabase
      .from("workout_exercises")
      .select("id, exercise_id")
      .in("workout_group_id", groupIds);

    if (weError || !workoutExercises || workoutExercises.length === 0)
      return [];

    const exerciseIds = [
      ...new Set(workoutExercises.map((we) => we.exercise_id as string)),
    ];

    // 4. Get primary muscles for each exercise from catalog
    const { data: exercises, error: exError } = await this.supabase
      .from("exercises")
      .select("id, primary_muscles")
      .in("id", exerciseIds);

    if (exError || !exercises) return [];

    // Build maps
    const exerciseMuscleMap = new Map<string, string[]>(
      exercises.map((e) => [e.id as string, e.primary_muscles as string[]]),
    );
    const weToExerciseMap = new Map<string, string>(
      workoutExercises.map((we) => [we.id as string, we.exercise_id as string]),
    );

    // Collect all unique primary muscles from the plan
    const allMuscles = new Set<string>();
    for (const muscles of exerciseMuscleMap.values()) {
      for (const m of muscles) allMuscles.add(m);
    }

    if (allMuscles.size === 0) return [];

    // 5. Get workout logs from the last 7 days for these workout exercises
    const workoutExerciseIds = workoutExercises.map((we) => we.id as string);

    const { data: logs, error: logsError } = await this.supabase
      .from("workout_logs")
      .select("workout_exercise_id, weight, workout_session_id")
      .eq("athlete_id", athleteId)
      .in("workout_exercise_id", workoutExerciseIds)
      .gte("completed_at", since.toISOString())
      .not("workout_session_id", "is", null);

    if (logsError || !logs) {
      return [...allMuscles].map((name) => ({ name, averageWeight: 0 }));
    }

    // 6. For each muscle group, compute average weight per session
    const muscleSessionWeights = new Map<string, Map<string, number>>();
    for (const muscle of allMuscles) {
      muscleSessionWeights.set(muscle, new Map());
    }

    for (const log of logs) {
      const exerciseId = weToExerciseMap.get(log.workout_exercise_id as string);
      if (!exerciseId) continue;
      const muscles = exerciseMuscleMap.get(exerciseId);
      if (!muscles) continue;
      const sessionId = log.workout_session_id as string;
      const weight = Number(log.weight);

      for (const muscle of muscles) {
        if (!allMuscles.has(muscle)) continue;
        const sessions = muscleSessionWeights.get(muscle);
        if (!sessions) continue;
        sessions.set(sessionId, (sessions.get(sessionId) ?? 0) + weight);
      }
    }

    // 7. Average across sessions
    const result: MuscleGroupChartEntry[] = [];
    for (const muscle of allMuscles) {
      const sessions = muscleSessionWeights.get(muscle);
      if (!sessions || sessions.size === 0) {
        result.push({ name: muscle, averageWeight: 0 });
      } else {
        const total = [...sessions.values()].reduce((a, b) => a + b, 0);
        result.push({
          name: muscle,
          averageWeight: Math.round((total / sessions.size) * 100) / 100,
        });
      }
    }

    return result;
  }
}
