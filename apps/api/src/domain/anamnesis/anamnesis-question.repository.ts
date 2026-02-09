import type { AnamnesisQuestion } from "./anamnesis-question.entity";

export interface IAnamnesisQuestionRepository {
  create(data: {
    groupId: string;
    label: string;
    fieldType: string;
    options?: string[];
    required?: boolean;
    displayOrder: number;
    profileField?: string | null;
  }): Promise<AnamnesisQuestion>;
  findById(id: string): Promise<AnamnesisQuestion | null>;
  findByGroupId(groupId: string): Promise<AnamnesisQuestion[]>;
  findByTemplateId(templateId: string): Promise<AnamnesisQuestion[]>;
  update(
    id: string,
    data: {
      label?: string;
      fieldType?: string;
      options?: string[];
      required?: boolean;
      displayOrder?: number;
      profileField?: string | null;
    },
  ): Promise<AnamnesisQuestion>;
  delete(id: string): Promise<void>;
}
