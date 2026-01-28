import type { AnamnesisResponse } from "../../domain/anamnesis/anamnesis-response.entity";
import type { IAnamnesisResponseRepository } from "../../domain/anamnesis/anamnesis-response.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";

export class SubmitResponseUseCase {
  constructor(
    private readonly responseRepository: IAnamnesisResponseRepository,
    private readonly templateRepository: IAnamnesisTemplateRepository,
  ) {}

  async execute(
    templateId: string,
    athleteId: string,
    answers: Record<string, unknown>,
  ): Promise<AnamnesisResponse> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) throw new Error("Template not found");

    const existing = await this.responseRepository.findByTemplateAndAthlete(
      templateId,
      athleteId,
    );
    if (existing) throw new Error("Response already submitted");

    return this.responseRepository.create({ templateId, athleteId, answers });
  }
}
