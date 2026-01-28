export interface AnamnesisTemplate {
  id: string;
  name: string;
  jsonSchema: Record<string, unknown> | null;
  uiSchema: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
