import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnamnesisResponse } from "../../domain/anamnesis/anamnesis-response.entity";
import type { IAnamnesisResponseRepository } from "../../domain/anamnesis/anamnesis-response.repository";

export class AnamnesisResponseRepository implements IAnamnesisResponseRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: {
    templateId: string;
    athleteId: string;
    answers: Record<string, unknown>;
  }): Promise<AnamnesisResponse> {
    const { data, error } = await this.supabase
      .from("anamnesis_responses")
      .insert({
        template_id: input.templateId,
        athlete_id: input.athleteId,
        answers: input.answers,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async findByTemplateAndAthlete(templateId: string, athleteId: string): Promise<AnamnesisResponse | null> {
    const { data, error } = await this.supabase
      .from("anamnesis_responses")
      .select()
      .eq("template_id", templateId)
      .eq("athlete_id", athleteId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return this.toEntity(data);
  }

  private toEntity(data: Record<string, unknown>): AnamnesisResponse {
    return {
      id: data.id as string,
      templateId: data.template_id as string,
      athleteId: data.athlete_id as string,
      answers: data.answers as Record<string, unknown>,
      completedAt: new Date(data.completed_at as string),
    };
  }
}
