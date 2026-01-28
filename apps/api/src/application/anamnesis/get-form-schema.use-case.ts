import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";

interface FormSchema {
  jsonSchema: Record<string, unknown>;
  uiSchema: Record<string, unknown>;
}

export class GetFormSchemaUseCase {
  constructor(private readonly templateRepository: IAnamnesisTemplateRepository) {}

  async execute(templateId: string): Promise<FormSchema | null> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) return null;

    return {
      jsonSchema: template.jsonSchema ?? { type: "object", properties: {} },
      uiSchema: template.uiSchema ?? {},
    };
  }
}
