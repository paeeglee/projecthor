import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnamnesisTemplate } from "../../domain/anamnesis/anamnesis-template.entity";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";

export class AnamnesisTemplateRepository
  implements IAnamnesisTemplateRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async create(name: string): Promise<AnamnesisTemplate> {
    const { data, error } = await this.supabase
      .from("anamnesis_templates")
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async findById(id: string): Promise<AnamnesisTemplate | null> {
    const { data, error } = await this.supabase
      .from("anamnesis_templates")
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
    updateData: {
      name?: string;
      jsonSchema?: Record<string, unknown>;
      uiSchema?: Record<string, unknown>;
    },
  ): Promise<AnamnesisTemplate> {
    const dbData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updateData.name !== undefined) dbData.name = updateData.name;
    if (updateData.jsonSchema !== undefined)
      dbData.json_schema = updateData.jsonSchema;
    if (updateData.uiSchema !== undefined)
      dbData.ui_schema = updateData.uiSchema;

    const { data, error } = await this.supabase
      .from("anamnesis_templates")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  private toEntity(data: Record<string, unknown>): AnamnesisTemplate {
    return {
      id: data.id as string,
      name: data.name as string,
      jsonSchema: data.json_schema as Record<string, unknown> | null,
      uiSchema: data.ui_schema as Record<string, unknown> | null,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
