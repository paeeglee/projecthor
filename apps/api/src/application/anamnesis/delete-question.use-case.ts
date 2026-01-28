import type { IAnamnesisGroupRepository } from "../../domain/anamnesis/anamnesis-group.repository";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";
import { generateSchemas } from "./schema-generator";

export class DeleteQuestionUseCase {
  constructor(
    private readonly questionRepository: IAnamnesisQuestionRepository,
    private readonly groupRepository: IAnamnesisGroupRepository,
    private readonly templateRepository: IAnamnesisTemplateRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const question = await this.questionRepository.findById(id);
    if (!question) return;

    const group = await this.groupRepository.findById(question.groupId);
    await this.questionRepository.delete(id);

    if (group) {
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
    }
  }
}
