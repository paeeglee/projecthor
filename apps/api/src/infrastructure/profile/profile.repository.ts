import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "../../domain/profile/profile.entity";
import type { IProfileRepository } from "../../domain/profile/profile.repository";

export class ProfileRepository implements IProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      bodyWeight: Number(data.body_weight),
      bodyWeightUpdatedAt: new Date(data.body_weight_updated_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async create(userId: string, bodyWeight: number): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .insert({ user_id: userId, body_weight: bodyWeight })
      .select()
      .single();

    if (error || !data) throw new Error("Failed to create profile");

    return {
      id: data.id,
      userId: data.user_id,
      bodyWeight: Number(data.body_weight),
      bodyWeightUpdatedAt: new Date(data.body_weight_updated_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateBodyWeight(userId: string, bodyWeight: number): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({
        body_weight: bodyWeight,
        body_weight_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) throw new Error("Failed to update body weight");

    return {
      id: data.id,
      userId: data.user_id,
      bodyWeight: Number(data.body_weight),
      bodyWeightUpdatedAt: new Date(data.body_weight_updated_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
