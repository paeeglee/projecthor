import type { AnamnesisTemplate } from "../../domain/anamnesis/anamnesis-template.entity";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";

export class CreateTemplateUseCase {
  constructor(
    private readonly templateRepository: IAnamnesisTemplateRepository,
  ) {}

  async execute(name: string): Promise<AnamnesisTemplate> {
    return this.templateRepository.create(name);
  }
}
