import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutPlan } from "../../domain/workout/workout-plan.entity";
import type { IWorkoutPlanRepository } from "../../domain/workout/workout-plan.repository";

export class WorkoutPlanRepository implements IWorkoutPlanRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(athleteId: string, name: string): Promise<WorkoutPlan> {
    const { data, error } = await this.supabase
      .from("workout_plans")
      .insert({ athlete_id: athleteId, name })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async findActiveByAthleteId(athleteId: string): Promise<WorkoutPlan | null> {
    const { data, error } = await this.supabase
      .from("workout_plans")
      .select()
      .eq("athlete_id", athleteId)
      .eq("active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return this.toEntity(data);
  }

  async findById(id: string): Promise<WorkoutPlan | null> {
    const { data, error } = await this.supabase
      .from("workout_plans")
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
    updateData: { name?: string },
  ): Promise<WorkoutPlan> {
    const dbData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updateData.name !== undefined) dbData.name = updateData.name;

    const { data, error } = await this.supabase
      .from("workout_plans")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("workout_plans")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async deactivateAllByAthleteId(athleteId: string): Promise<void> {
    const { error } = await this.supabase
      .from("workout_plans")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("athlete_id", athleteId)
      .eq("active", true);

    if (error) throw error;
  }

  private toEntity(data: Record<string, unknown>): WorkoutPlan {
    return {
      id: data.id as string,
      athleteId: data.athlete_id as string,
      name: data.name as string,
      active: data.active as boolean,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
