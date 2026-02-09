import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { AnamnesisResponse } from "../../domain/anamnesis/anamnesis-response.entity";
import type { IAnamnesisResponseRepository } from "../../domain/anamnesis/anamnesis-response.repository";
import type { IAnamnesisTemplateRepository } from "../../domain/anamnesis/anamnesis-template.repository";
import type { Profile } from "../../domain/profile/profile.entity";
import { PROFILE_FIELD_TYPES } from "../../domain/profile/profile-fields";
import type { IProfileRepository } from "../../domain/profile/profile.repository";

export class SubmitResponseUseCase {
  constructor(
    private readonly responseRepository: IAnamnesisResponseRepository,
    private readonly templateRepository: IAnamnesisTemplateRepository,
    private readonly questionRepository: IAnamnesisQuestionRepository,
    private readonly profileRepository: IProfileRepository,
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

    const response = await this.responseRepository.create({
      templateId,
      athleteId,
      answers,
    });

    await this.syncProfileFields(templateId, athleteId, answers);

    return response;
  }

  private async syncProfileFields(
    templateId: string,
    athleteId: string,
    answers: Record<string, unknown>,
  ): Promise<void> {
    const questions =
      await this.questionRepository.findByTemplateId(templateId);
    const linkedQuestions = questions.filter((q) => q.profileField !== null);

    if (linkedQuestions.length === 0) return;

    const fields: Partial<Pick<Profile, "bodyWeight">> = {};

    for (const question of linkedQuestions) {
      // Frontend submits flat answers with g_ prefix (q_ replaced by g_)
      const flatKey = `g_${question.id}`;
      let rawValue: unknown = answers[flatKey];

      // Fallback: check nested group answers with q_ prefix (API/direct submissions)
      if (rawValue === undefined) {
        const nestedKey = `q_${question.id}`;
        for (const groupAnswers of Object.values(answers)) {
          if (
            typeof groupAnswers === "object" &&
            groupAnswers !== null &&
            nestedKey in groupAnswers
          ) {
            rawValue = (groupAnswers as Record<string, unknown>)[nestedKey];
            break;
          }
        }
      }

      if (rawValue === undefined) continue;

      const fieldName = question.profileField as keyof Pick<
        Profile,
        "bodyWeight"
      >;
      const fieldType = PROFILE_FIELD_TYPES[fieldName];
      if (!fieldType) continue;

      if (fieldType === "number") {
        const num = parseFloat(String(rawValue));
        if (!Number.isNaN(num)) {
          fields[fieldName] = num;
        }
      }
    }

    if (Object.keys(fields).length > 0) {
      await this.profileRepository.updateFields(athleteId, fields);
    }
  }
}
