import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IRelativeStrengthRepository,
  WorkoutLogWithExercise,
} from "../../domain/dashboard/relative-strength.repository";

export class RelativeStrengthRepository implements IRelativeStrengthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getLogsWithExerciseMetadata(
    athleteId: string,
    since: Date,
  ): Promise<WorkoutLogWithExercise[]> {
    return this.fetchLogs(athleteId, since);
  }

  async getAllLogsWithExerciseMetadata(
    athleteId: string,
  ): Promise<WorkoutLogWithExercise[]> {
    return this.fetchLogs(athleteId, null);
  }

  private async fetchLogs(
    athleteId: string,
    since: Date | null,
  ): Promise<WorkoutLogWithExercise[]> {
    let logsQuery = this.supabase
      .from("workout_logs")
      .select("workout_exercise_id, weight, reps_completed, completed_at")
      .eq("athlete_id", athleteId)
      .not("workout_session_id", "is", null)
      .gt("weight", 0);

    if (since) {
      logsQuery = logsQuery.gte("completed_at", since.toISOString());
    }

    const { data: logs, error: logsError } = await logsQuery;
    if (logsError || !logs || logs.length === 0) return [];

    const weIds = [
      ...new Set(logs.map((l) => l.workout_exercise_id as string)),
    ];

    const { data: workoutExercises, error: weError } = await this.supabase
      .from("workout_exercises")
      .select("id, exercise_id")
      .in("id", weIds);

    if (weError || !workoutExercises) return [];

    const weToExerciseId = new Map<string, string>(
      workoutExercises.map((we) => [we.id as string, we.exercise_id as string]),
    );

    const exerciseIds = [...new Set(weToExerciseId.values())];
    const { data: exercises, error: exError } = await this.supabase
      .from("exercises")
      .select("id, force, primary_muscles, category")
      .in("id", exerciseIds);

    if (exError || !exercises) return [];

    const exerciseMap = new Map(
      exercises.map((e) => [
        e.id as string,
        {
          force: e.force as string | null,
          primaryMuscles: e.primary_muscles as string[],
          category: e.category as string,
        },
      ]),
    );

    return logs
      .map((log) => {
        const exerciseId = weToExerciseId.get(
          log.workout_exercise_id as string,
        );
        if (!exerciseId) return null;
        const meta = exerciseMap.get(exerciseId);
        if (!meta) return null;

        return {
          weight: Number(log.weight),
          repsCompleted: Number(log.reps_completed),
          completedAt: new Date(log.completed_at as string),
          exerciseForce: meta.force,
          exercisePrimaryMuscles: meta.primaryMuscles,
          exerciseCategory: meta.category,
        };
      })
      .filter((l): l is WorkoutLogWithExercise => l !== null);
  }
}
