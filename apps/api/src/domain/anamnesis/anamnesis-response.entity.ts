export interface AnamnesisResponse {
  id: string;
  templateId: string;
  athleteId: string;
  answers: Record<string, unknown>;
  completedAt: Date;
}
