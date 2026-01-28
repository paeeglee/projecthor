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
}
