import type { GeneratedWorkout } from "../../domain/ai/ai.types";
import type { IAiClientRepository } from "../../domain/ai/ai-client.repository";
import type { IAnamnesisQuestionRepository } from "../../domain/anamnesis/anamnesis-question.repository";
import type { AnamnesisResponse } from "../../domain/anamnesis/anamnesis-response.entity";
import type { IAnamnesisResponseRepository } from "../../domain/anamnesis/anamnesis-response.repository";
import type { Exercise } from "../../domain/exercise/exercise.entity";
import type { IExerciseRepository } from "../../domain/exercise/exercise.repository";
import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";
import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";
import type { IWorkoutPlanRepository } from "../../domain/workout/workout-plan.repository";
import { findClosestSlug } from "../../infrastructure/ai/slug-matcher";
import { jsonToToon } from "../../infrastructure/ai/toon-encoder";

export class GenerateWorkoutUseCase {
  constructor(
    private readonly aiClient: IAiClientRepository,
    private readonly anamnesisResponseRepository: IAnamnesisResponseRepository,
    private readonly anamnesisQuestionRepository: IAnamnesisQuestionRepository,
    private readonly exerciseRepository: IExerciseRepository,
    private readonly workoutPlanRepository: IWorkoutPlanRepository,
    private readonly workoutGroupRepository: IWorkoutGroupRepository,
    private readonly workoutExerciseRepository: IWorkoutExerciseRepository,
  ) {}

  async execute(athleteId: string): Promise<void> {
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
    });

    const generated = JSON.parse(
      this.extractJson(response.content),
    ) as GeneratedWorkout;
    await this.persistWorkout(athleteId, generated, exercises);
  }

  private async persistWorkout(
    athleteId: string,
    generated: GeneratedWorkout,
    exercises: Exercise[],
  ): Promise<void> {
    const slugToId = new Map(exercises.map((e) => [e.slug, e.id]));

    const allSlugs = [...slugToId.keys()];

    // Validate all slugs exist before writing anything, with fuzzy fallback
    for (const group of generated.groups) {
      for (const ex of group.exercises) {
        if (!slugToId.has(ex.exerciseSlug)) {
          const closest = findClosestSlug(ex.exerciseSlug, allSlugs);
          if (closest) {
            console.warn(
              `[slug-matcher] Corrected "${ex.exerciseSlug}" → "${closest}"`,
            );
            ex.exerciseSlug = closest;
          } else {
            throw new Error(`Exercise not found: ${ex.exerciseSlug}`);
          }
        }
      }
    }

    // Deactivate existing plans and create new one
    await this.workoutPlanRepository.deactivateAllByAthleteId(athleteId);
    const plan = await this.workoutPlanRepository.create(
      athleteId,
      generated.name,
    );

    // Create groups and exercises
    for (let gi = 0; gi < generated.groups.length; gi++) {
      const genGroup = generated.groups[gi];
      const group = await this.workoutGroupRepository.create(
        plan.id,
        genGroup.name,
        gi,
      );

      for (let ei = 0; ei < genGroup.exercises.length; ei++) {
        const genEx = genGroup.exercises[ei];
        await this.workoutExerciseRepository.create({
          workoutGroupId: group.id,
          exerciseId: slugToId.get(genEx.exerciseSlug)!,
          sets: genEx.sets,
          reps: this.parseReps(genEx.reps),
          displayOrder: ei,
          restSeconds: genEx.restSeconds,
          notes: genEx.notes,
        });
      }
    }
  }

  private extractJson(text: string): string {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();
  }

  private parseReps(reps: string): number {
    const matches = reps.match(/\d+/g);
    if (!matches || matches.length === 0) {
      return 0;
    }
    return Number(matches[matches.length - 1]);
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
      'Respond ONLY with valid JSON: {"name":"Plan name","groups":[{"name":"A","exercises":[{"exerciseSlug":"slug","sets":3,"reps":"8-12","restSeconds":60,"notes":"optional"}]}]}',
      'CRITICAL: The "exerciseSlug" value MUST be copied exactly from the "slug" column above. Do NOT invent, abbreviate, or modify slugs. If the slug in the catalog is "wide-grip-lat-pulldown", you must use "wide-grip-lat-pulldown", NOT "lat-pulldown".',
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
