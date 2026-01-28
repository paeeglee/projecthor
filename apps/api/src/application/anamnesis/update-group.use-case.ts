import type { AnamnesisGroup } from "../../domain/anamnesis/anamnesis-group.entity";
import type { IAnamnesisGroupRepository } from "../../domain/anamnesis/anamnesis-group.repository";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";
import { generateSchemas } from "./schema-generator";

export class UpdateGroupUseCase {
  constructor(
    private readonly groupRepository: IAnamnesisGroupRepository,
    private readonly templateRepository: IAnamnesisTemplateRepository,
    private readonly questionRepository: IAnamnesisQuestionRepository,
  ) {}

  async execute(
    id: string,
    data: { name?: string; displayOrder?: number },
  ): Promise<AnamnesisGroup> {
    const group = await this.groupRepository.update(id, data);

    const groups = await this.groupRepository.findByTemplateId(
      group.templateId,
    );
    const questions = await this.questionRepository.findByTemplateId(
      group.templateId,
    );
    const { jsonSchema, uiSchema } = generateSchemas(groups, questions);
    await this.templateRepository.update(group.templateId, {
      jsonSchema,
      uiSchema,
    });

    return group;
  }
}
