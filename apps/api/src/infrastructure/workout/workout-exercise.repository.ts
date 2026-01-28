import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutExercise } from "../../domain/workout/workout-exercise.entity";
import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";

export class WorkoutExerciseRepository implements IWorkoutExerciseRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: {
    workoutGroupId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    displayOrder: number;
  }): Promise<WorkoutExercise> {
    const { data: row, error } = await this.supabase
      .from("workout_exercises")
      .insert({
        workout_group_id: data.workoutGroupId,
        exercise_id: data.exerciseId,
        sets: data.sets,
        reps: data.reps,
        display_order: data.displayOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(row);
  }

  async findByGroupId(workoutGroupId: string): Promise<WorkoutExercise[]> {
    const { data, error } = await this.supabase
      .from("workout_exercises")
      .select()
      .eq("workout_group_id", workoutGroupId)
      .order("display_order");

    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<WorkoutExercise | null> {
    const { data, error } = await this.supabase
      .from("workout_exercises")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return this.toEntity(data);
  }

  async update(
    id: string,
    updateData: { sets?: number; reps?: number; displayOrder?: number },
  ): Promise<WorkoutExercise> {
    const dbData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updateData.sets !== undefined) dbData.sets = updateData.sets;
    if (updateData.reps !== undefined) dbData.reps = updateData.reps;
    if (updateData.displayOrder !== undefined)
      dbData.display_order = updateData.displayOrder;

    const { data, error } = await this.supabase
      .from("workout_exercises")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("workout_exercises")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private toEntity(data: Record<string, unknown>): WorkoutExercise {
    return {
      id: data.id as string,
      workoutGroupId: data.workout_group_id as string,
      exerciseId: data.exercise_id as string,
      sets: data.sets as number,
      reps: data.reps as number,
      displayOrder: data.display_order as number,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
