import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnamnesisQuestion } from "../../domain/anamnesis/anamnesis-question.entity";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";

export class AnamnesisQuestionRepository implements IAnamnesisQuestionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: {
    groupId: string;
    label: string;
    fieldType: string;
    options?: string[];
    required?: boolean;
    displayOrder: number;
  }): Promise<AnamnesisQuestion> {
    const { data, error } = await this.supabase
      .from("anamnesis_questions")
      .insert({
        group_id: input.groupId,
        label: input.label,
        field_type: input.fieldType,
        options: input.options ?? null,
        required: input.required ?? false,
        display_order: input.displayOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async findById(id: string): Promise<AnamnesisQuestion | null> {
    const { data, error } = await this.supabase
      .from("anamnesis_questions")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return this.toEntity(data);
  }

  async findByGroupId(groupId: string): Promise<AnamnesisQuestion[]> {
    const { data, error } = await this.supabase
      .from("anamnesis_questions")
      .select()
      .eq("group_id", groupId)
      .order("display_order");

    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async findByTemplateId(templateId: string): Promise<AnamnesisQuestion[]> {
    const { data, error } = await this.supabase
      .from("anamnesis_questions")
      .select("*, anamnesis_groups!inner(template_id)")
      .eq("anamnesis_groups.template_id", templateId)
      .order("display_order");

    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async update(
    id: string,
    updateData: { label?: string; fieldType?: string; options?: string[]; required?: boolean; displayOrder?: number },
  ): Promise<AnamnesisQuestion> {
    const dbData: Record<string, unknown> = {};
    if (updateData.label !== undefined) dbData.label = updateData.label;
    if (updateData.fieldType !== undefined) dbData.field_type = updateData.fieldType;
    if (updateData.options !== undefined) dbData.options = updateData.options;
    if (updateData.required !== undefined) dbData.required = updateData.required;
    if (updateData.displayOrder !== undefined) dbData.display_order = updateData.displayOrder;

    const { data, error } = await this.supabase
      .from("anamnesis_questions")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("anamnesis_questions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private toEntity(data: Record<string, unknown>): AnamnesisQuestion {
    return {
      id: data.id as string,
      groupId: data.group_id as string,
      label: data.label as string,
      fieldType: data.field_type as AnamnesisQuestion["fieldType"],
      options: data.options as string[] | null,
      required: data.required as boolean,
      displayOrder: data.display_order as number,
      createdAt: new Date(data.created_at as string),
    };
  }
}
