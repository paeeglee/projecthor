import type { AnamnesisGroup } from "../../domain/anamnesis/anamnesis-group.entity";
import type { IAnamnesisGroupRepository } from "../../domain/anamnesis/anamnesis-group.repository";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";
import { generateSchemas } from "./schema-generator";

export class CreateGroupUseCase {
  constructor(
    private readonly groupRepository: IAnamnesisGroupRepository,
    private readonly templateRepository: IAnamnesisTemplateRepository,
    private readonly questionRepository: IAnamnesisQuestionRepository,
  ) {}

  async execute(templateId: string, name: string, displayOrder: number): Promise<AnamnesisGroup> {
    const group = await this.groupRepository.create(templateId, name, displayOrder);

    const groups = await this.groupRepository.findByTemplateId(templateId);
    const questions = await this.questionRepository.findByTemplateId(templateId);
    const { jsonSchema, uiSchema } = generateSchemas(groups, questions);
    await this.templateRepository.update(templateId, { jsonSchema, uiSchema });

    return group;
  }
}
