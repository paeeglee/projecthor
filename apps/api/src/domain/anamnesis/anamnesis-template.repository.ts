import type { AnamnesisTemplate } from "./anamnesis-template.entity";

export interface IAnamnesisTemplateRepository {
  create(name: string): Promise<AnamnesisTemplate>;
  findById(id: string): Promise<AnamnesisTemplate | null>;
  update(
    id: string,
    data: {
      name?: string;
      jsonSchema?: Record<string, unknown>;
      uiSchema?: Record<string, unknown>;
    },
  ): Promise<AnamnesisTemplate>;
}
