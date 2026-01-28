import type { WorkoutExercise } from "../../domain/workout/workout-exercise.entity";
import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";
import type { WorkoutGroup } from "../../domain/workout/workout-group.entity";
import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";
import type { WorkoutPlan } from "../../domain/workout/workout-plan.entity";
import type { IWorkoutPlanRepository } from "../../domain/workout/workout-plan.repository";

interface WorkoutPlanWithDetails {
  plan: WorkoutPlan;
  groups: (WorkoutGroup & { exercises: WorkoutExercise[] })[];
}

export class GetWorkoutPlanUseCase {
  constructor(
    private readonly planRepository: IWorkoutPlanRepository,
    private readonly groupRepository: IWorkoutGroupRepository,
    private readonly exerciseRepository: IWorkoutExerciseRepository,
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

    return { plan, groups: groupsWithExercises };
  }
}
