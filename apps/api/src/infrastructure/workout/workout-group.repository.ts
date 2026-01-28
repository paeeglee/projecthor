import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutGroup } from "../../domain/workout/workout-group.entity";
import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";

export class WorkoutGroupRepository implements IWorkoutGroupRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(
    workoutPlanId: string,
    label: string,
    displayOrder: number,
  ): Promise<WorkoutGroup> {
    const { data, error } = await this.supabase
      .from("workout_groups")
      .insert({
        workout_plan_id: workoutPlanId,
        label,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async findByPlanId(workoutPlanId: string): Promise<WorkoutGroup[]> {
    const { data, error } = await this.supabase
      .from("workout_groups")
      .select()
      .eq("workout_plan_id", workoutPlanId)
      .order("display_order");

    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<WorkoutGroup | null> {
    const { data, error } = await this.supabase
      .from("workout_groups")
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
    updateData: { label?: string; displayOrder?: number },
  ): Promise<WorkoutGroup> {
    const dbData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updateData.label !== undefined) dbData.label = updateData.label;
    if (updateData.displayOrder !== undefined)
      dbData.display_order = updateData.displayOrder;

    const { data, error } = await this.supabase
      .from("workout_groups")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("workout_groups")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private toEntity(data: Record<string, unknown>): WorkoutGroup {
    return {
      id: data.id as string,
      workoutPlanId: data.workout_plan_id as string,
      label: data.label as string,
      displayOrder: data.display_order as number,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
