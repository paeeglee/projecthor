import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnamnesisGroup } from "../../domain/anamnesis/anamnesis-group.entity";
import type { IAnamnesisGroupRepository } from "../../domain/anamnesis/anamnesis-group.repository";

export class AnamnesisGroupRepository implements IAnamnesisGroupRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(templateId: string, name: string, displayOrder: number): Promise<AnamnesisGroup> {
    const { data, error } = await this.supabase
      .from("anamnesis_groups")
      .insert({ template_id: templateId, name, display_order: displayOrder })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async findById(id: string): Promise<AnamnesisGroup | null> {
    const { data, error } = await this.supabase
      .from("anamnesis_groups")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return this.toEntity(data);
  }

  async findByTemplateId(templateId: string): Promise<AnamnesisGroup[]> {
    const { data, error } = await this.supabase
      .from("anamnesis_groups")
      .select()
      .eq("template_id", templateId)
      .order("display_order");

    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async update(id: string, updateData: { name?: string; displayOrder?: number }): Promise<AnamnesisGroup> {
    const dbData: Record<string, unknown> = {};
    if (updateData.name !== undefined) dbData.name = updateData.name;
    if (updateData.displayOrder !== undefined) dbData.display_order = updateData.displayOrder;

    const { data, error } = await this.supabase
      .from("anamnesis_groups")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("anamnesis_groups")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private toEntity(data: Record<string, unknown>): AnamnesisGroup {
    return {
      id: data.id as string,
      templateId: data.template_id as string,
      name: data.name as string,
      displayOrder: data.display_order as number,
      createdAt: new Date(data.created_at as string),
    };
  }
}
