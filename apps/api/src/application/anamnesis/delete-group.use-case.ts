import type { IAnamnesisGroupRepository } from "../../domain/anamnesis/anamnesis-group.repository";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";
import { generateSchemas } from "./schema-generator";

export class DeleteGroupUseCase {
  constructor(
    private readonly groupRepository: IAnamnesisGroupRepository,
    private readonly templateRepository: IAnamnesisTemplateRepository,
    private readonly questionRepository: IAnamnesisQuestionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const group = await this.groupRepository.findById(id);
    if (!group) return;

    const templateId = group.templateId;
    await this.groupRepository.delete(id);

    const groups = await this.groupRepository.findByTemplateId(templateId);
    const questions = await this.questionRepository.findByTemplateId(templateId);
    const { jsonSchema, uiSchema } = generateSchemas(groups, questions);
    await this.templateRepository.update(templateId, { jsonSchema, uiSchema });
  }
}
