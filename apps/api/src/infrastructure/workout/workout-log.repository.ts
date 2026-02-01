import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutLog } from "../../domain/workout/workout-log.entity";
import type { IWorkoutLogRepository } from "../../domain/workout/workout-log.repository";

export class WorkoutLogRepository implements IWorkoutLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: {
    workoutExerciseId: string;
    athleteId: string;
    setsCompleted: number;
    repsCompleted: number;
    weight: number;
    notes?: string;
    workoutSessionId?: string;
  }): Promise<WorkoutLog> {
    const { data: row, error } = await this.supabase
      .from("workout_logs")
      .insert({
        workout_exercise_id: data.workoutExerciseId,
        athlete_id: data.athleteId,
        sets_completed: data.setsCompleted,
        reps_completed: data.repsCompleted,
        weight: data.weight,
        notes: data.notes ?? null,
        workout_session_id: data.workoutSessionId ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(row);
  }

  async findByWorkoutExerciseId(
    workoutExerciseId: string,
  ): Promise<WorkoutLog[]> {
    const { data, error } = await this.supabase
      .from("workout_logs")
      .select()
      .eq("workout_exercise_id", workoutExerciseId)
      .order("completed_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  private toEntity(data: Record<string, unknown>): WorkoutLog {
    return {
      id: data.id as string,
      workoutExerciseId: data.workout_exercise_id as string,
      athleteId: data.athlete_id as string,
      setsCompleted: data.sets_completed as number,
      repsCompleted: data.reps_completed as number,
      weight: Number(data.weight),
      notes: data.notes as string | null,
      workoutSessionId: (data.workout_session_id as string) ?? null,
      completedAt: new Date(data.completed_at as string),
      createdAt: new Date(data.created_at as string),
    };
  }
}
