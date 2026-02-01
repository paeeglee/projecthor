import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "../../domain/profile/profile.entity";
import type { IProfileRepository } from "../../domain/profile/profile.repository";

function toProfile(data: Record<string, unknown>): Profile {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    fullName: data.full_name as string,
    bodyWeight: data.body_weight ? Number(data.body_weight) : null,
    bodyWeightUpdatedAt: new Date(data.body_weight_updated_at as string),
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
  };
}

export class ProfileRepository implements IProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    return toProfile(data);
  }

  async create(
    userId: string,
    fullName: string,
    bodyWeight?: number,
  ): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .insert({
        user_id: userId,
        full_name: fullName,
        ...(bodyWeight != null && { body_weight: bodyWeight }),
      })
      .select()
      .single();

    if (error || !data) throw new Error("Failed to create profile");

    return toProfile(data);
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

    return toProfile(data);
  }
}
