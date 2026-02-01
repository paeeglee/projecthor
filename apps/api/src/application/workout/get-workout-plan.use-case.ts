import type { IExerciseRepository } from "../../domain/exercise/exercise.repository";
import type { WorkoutExercise } from "../../domain/workout/workout-exercise.entity";
import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";
import type { WorkoutGroup } from "../../domain/workout/workout-group.entity";
import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";
import type { WorkoutPlan } from "../../domain/workout/workout-plan.entity";
import type { IWorkoutPlanRepository } from "../../domain/workout/workout-plan.repository";

interface HydratedExercise extends WorkoutExercise {
  exerciseName: string;
}

interface HydratedGroup extends WorkoutGroup {
  exercises: HydratedExercise[];
  targetMuscles: string[];
}

interface WorkoutPlanWithDetails {
  plan: WorkoutPlan;
  groups: HydratedGroup[];
}

export class GetWorkoutPlanUseCase {
  constructor(
    private readonly planRepository: IWorkoutPlanRepository,
    private readonly groupRepository: IWorkoutGroupRepository,
    private readonly exerciseRepository: IWorkoutExerciseRepository,
    private readonly catalogRepository: IExerciseRepository,
  ) {}

  async execute(athleteId: string): Promise<WorkoutPlanWithDetails | null> {
    const plan = await this.planRepository.findActiveByAthleteId(athleteId);
    if (!plan) return null;

    const groups = await this.groupRepository.findByPlanId(plan.id);

    const groupsWithExercises = await Promise.all(
      groups.map(async (group) => ({
        ...group,
        exercises: await this.exerciseRepository.findByGroupId(group.id),
      })),
    );

    const allExerciseIds = groupsWithExercises.flatMap((g) =>
      g.exercises.map((e) => e.exerciseId),
    );
    const uniqueIds = [...new Set(allExerciseIds)];
    const catalog = await this.catalogRepository.findByIds(uniqueIds);
    const catalogMap = new Map(catalog.map((e) => [e.id, e]));

    const hydrated = groupsWithExercises.map((group) => {
      const muscles = new Set<string>();
      const exercises = group.exercises.map((e) => {
        const entry = catalogMap.get(e.exerciseId);
        entry?.primaryMuscles.forEach((m) => muscles.add(m));
        return {
          ...e,
          exerciseName: entry?.name ?? "Unknown exercise",
        };
      });
      return { ...group, exercises, targetMuscles: [...muscles] };
    });

    return { plan, groups: hydrated };
  }
}
