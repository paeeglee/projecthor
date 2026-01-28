import type { AnamnesisGroup } from "../../domain/anamnesis/anamnesis-group.entity";
import type { AnamnesisQuestion } from "../../domain/anamnesis/anamnesis-question.entity";
import type { AnamnesisTemplate } from "../../domain/anamnesis/anamnesis-template.entity";
import type { IAnamnesisGroupRepository } from "../../domain/anamnesis/anamnesis-group.repository";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";

interface TemplateWithDetails {
  template: AnamnesisTemplate;
  groups: (AnamnesisGroup & { questions: AnamnesisQuestion[] })[];
}

export class GetTemplateUseCase {
  constructor(
    private readonly templateRepository: IAnamnesisTemplateRepository,
    private readonly groupRepository: IAnamnesisGroupRepository,
    private readonly questionRepository: IAnamnesisQuestionRepository,
  ) {}

  async execute(id: string): Promise<TemplateWithDetails | null> {
    const template = await this.templateRepository.findById(id);
    if (!template) return null;

    const groups = await this.groupRepository.findByTemplateId(id);
    const questions = await this.questionRepository.findByTemplateId(id);

    const questionsByGroup = new Map<string, AnamnesisQuestion[]>();
    for (const q of questions) {
      const list = questionsByGroup.get(q.groupId) ?? [];
      list.push(q);
      questionsByGroup.set(q.groupId, list);
    }

    return {
      template,
      groups: groups.map((group) => ({
        ...group,
        questions: questionsByGroup.get(group.id) ?? [],
      })),
    };
  }
}
