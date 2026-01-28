import type { AnamnesisTemplate } from "../../domain/anamnesis/anamnesis-template.entity";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";

export class UpdateTemplateUseCase {
  constructor(
    private readonly templateRepository: IAnamnesisTemplateRepository,
  ) {}

  async execute(id: string, name: string): Promise<AnamnesisTemplate> {
    return this.templateRepository.update(id, { name });
  }
}
