export type FieldType =
  | "text"
  | "textarea"
  | "boolean"
  | "single_choice"
  | "multi_choice"
  | "integer";

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
