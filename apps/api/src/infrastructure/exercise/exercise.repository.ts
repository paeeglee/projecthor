import type { SupabaseClient } from "@supabase/supabase-js";
import type { Exercise } from "../../domain/exercise/exercise.entity";
import type { IExerciseRepository } from "../../domain/exercise/exercise.repository";

export class ExerciseRepository implements IExerciseRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findBySlug(slug: string): Promise<Exercise | null> {
    const { data, error } = await this.supabase
      .from("exercises")
      .select()
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      force: data.force,
      level: data.level,
      mechanic: data.mechanic,
      equipment: data.equipment,
      primaryMuscles: data.primary_muscles,
      secondaryMuscles: data.secondary_muscles,
      instructions: data.instructions,
      category: data.category,
      images: data.images,
      createdAt: new Date(data.created_at),
    };
  }

  async listAll(): Promise<Exercise[]> {
    const { data, error } = await this.supabase.from("exercises").select();

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      force: row.force,
      level: row.level,
      mechanic: row.mechanic,
      equipment: row.equipment,
      primaryMuscles: row.primary_muscles,
      secondaryMuscles: row.secondary_muscles,
      instructions: row.instructions,
      category: row.category,
      images: row.images,
      createdAt: new Date(row.created_at),
    }));
  }
}
