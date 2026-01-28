import type { AnamnesisQuestion } from "../../domain/anamnesis/anamnesis-question.entity";
import type { IAnamnesisGroupRepository } from "../../domain/anamnesis/anamnesis-group.repository";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";
import { generateSchemas } from "./schema-generator";

export class UpdateQuestionUseCase {
  constructor(
    private readonly questionRepository: IAnamnesisQuestionRepository,
    private readonly groupRepository: IAnamnesisGroupRepository,
    private readonly templateRepository: IAnamnesisTemplateRepository,
  ) {}

  async execute(
    id: string,
    data: { label?: string; fieldType?: string; options?: string[]; required?: boolean; displayOrder?: number },
  ): Promise<AnamnesisQuestion> {
    const question = await this.questionRepository.update(id, data);

    const group = await this.groupRepository.findById(question.groupId);
    if (group) {
      const groups = await this.groupRepository.findByTemplateId(group.templateId);
      const questions = await this.questionRepository.findByTemplateId(group.templateId);
      const { jsonSchema, uiSchema } = generateSchemas(groups, questions);
      await this.templateRepository.update(group.templateId, { jsonSchema, uiSchema });
    }

    return question;
  }
}
