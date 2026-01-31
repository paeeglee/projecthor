import type { AnamnesisResponse } from "./anamnesis-response.entity";

export interface IAnamnesisResponseRepository {
  create(data: {
    templateId: string;
    athleteId: string;
    answers: Record<string, unknown>;
  }): Promise<AnamnesisResponse>;
  findByTemplateAndAthlete(
    templateId: string,
    athleteId: string,
  ): Promise<AnamnesisResponse | null>;
  existsByAthleteId(athleteId: string): Promise<boolean>;
  findByAthleteId(athleteId: string): Promise<AnamnesisResponse | null>;
}
