import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutSession } from "../../domain/workout/workout-session.entity";
import type { IWorkoutSessionRepository } from "../../domain/workout/workout-session.repository";

export class WorkoutSessionRepository implements IWorkoutSessionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: {
    workoutGroupId: string;
    athleteId: string;
  }): Promise<WorkoutSession> {
    const { data: row, error } = await this.supabase
      .from("workout_sessions")
      .insert({
        workout_group_id: data.workoutGroupId,
        athlete_id: data.athleteId,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(row);
  }

  private toEntity(data: Record<string, unknown>): WorkoutSession {
    return {
      id: data.id as string,
      workoutGroupId: data.workout_group_id as string,
      athleteId: data.athlete_id as string,
      finishedAt: new Date(data.finished_at as string),
      createdAt: new Date(data.created_at as string),
    };
  }
}
