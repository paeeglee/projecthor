import type { AnamnesisGroup } from "./anamnesis-group.entity";

export interface IAnamnesisGroupRepository {
  create(templateId: string, name: string, displayOrder: number): Promise<AnamnesisGroup>;
  findById(id: string): Promise<AnamnesisGroup | null>;
  findByTemplateId(templateId: string): Promise<AnamnesisGroup[]>;
  update(id: string, data: { name?: string; displayOrder?: number }): Promise<AnamnesisGroup>;
  delete(id: string): Promise<void>;
}
