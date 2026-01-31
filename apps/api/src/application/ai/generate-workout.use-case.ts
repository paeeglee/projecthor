import type { IAiClientRepository } from "../../domain/ai/ai-client.repository";
import type { GeneratedWorkout } from "../../domain/ai/ai.types";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { AnamnesisResponse } from "../../domain/anamnesis/anamnesis-response.entity";
import type { IAnamnesisResponseRepository } from "../../domain/anamnesis/anamnesis-response.repository";
import type { Exercise } from "../../domain/exercise/exercise.entity";
import type { IExerciseRepository } from "../../domain/exercise/exercise.repository";
import { jsonToToon } from "../../infrastructure/ai/toon-encoder";

export class GenerateWorkoutUseCase {
  constructor(
    private readonly aiClient: IAiClientRepository,
    private readonly anamnesisResponseRepository: IAnamnesisResponseRepository,
    private readonly anamnesisQuestionRepository: IAnamnesisQuestionRepository,
    private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(athleteId: string): Promise<GeneratedWorkout> {
    const anamnesis =
      await this.anamnesisResponseRepository.findByAthleteId(athleteId);

    if (!anamnesis) {
      throw new Error("Anamnesis not found for athlete");
    }

    const [exercises, questions] = await Promise.all([
      this.exerciseRepository.listAll(),
      this.anamnesisQuestionRepository.findByTemplateId(anamnesis.templateId),
    ]);

    const questionLabelById = new Map(questions.map((q) => [q.id, q.label]));

    const systemMessage = this.buildSystemPrompt(exercises);
    const userMessage = this.buildUserPrompt(anamnesis, questionLabelById);

    const response = await this.aiClient.chat({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      model: "gpt-4o",
    });

    return JSON.parse(response.content) as GeneratedWorkout;
  }

  private buildSystemPrompt(exercises: Exercise[]): string {
    const exerciseCatalog = exercises.map((e) => ({
      slug: e.slug,
      name: e.name,
      category: e.category,
      level: e.level,
      primaryMuscles: e.primaryMuscles.join(";"),
    }));

    const catalogToon = jsonToToon(exerciseCatalog);

    return [
      "You are a professional fitness trainer AI. Generate a structured workout plan from the athlete's anamnesis.",
      "ONLY use exercises from this catalog (TOON):",
      catalogToon,
      'Respond ONLY with valid JSON: {"name":"Plan name","groups":[{"name":"Treino A","exercises":[{"exerciseSlug":"slug","sets":3,"reps":"8-12","restSeconds":60,"notes":"optional"}]}]}',
      "Rules: match exercises to athlete's level/goals/condition; consider injuries/limitations; appropriate sets/reps/rest; notes only when relevant.",
    ].join("\n");
  }

  private resolveAnswerLabels(
    answers: Record<string, unknown>,
    questionLabelById: Map<string, string>,
  ): Record<string, unknown> {
    const labeled: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(answers)) {
      const id = key.split("_").slice(1).join("_");
      const label = questionLabelById.get(id) ?? key;

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        const nested = this.resolveAnswerLabels(
          value as Record<string, unknown>,
          questionLabelById,
        );
        Object.assign(labeled, nested);
      } else {
        labeled[label] = value;
      }
    }

    return labeled;
  }

  private buildUserPrompt(
    anamnesis: AnamnesisResponse,
    questionLabelById: Map<string, string>,
  ): string {
    const labeledAnswers = this.resolveAnswerLabels(
      anamnesis.answers,
      questionLabelById,
    );
    const anamnesisToon = jsonToToon(labeledAnswers);

    return `Athlete anamnesis (TOON):\n${anamnesisToon}`;
  }
}
