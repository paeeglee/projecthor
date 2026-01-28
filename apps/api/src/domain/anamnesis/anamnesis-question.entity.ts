export type FieldType = "text" | "boolean" | "single_choice" | "multi_choice";

export interface AnamnesisQuestion {
  id: string;
  groupId: string;
  label: string;
  fieldType: FieldType;
  options: string[] | null;
  required: boolean;
  displayOrder: number;
  createdAt: Date;
}
