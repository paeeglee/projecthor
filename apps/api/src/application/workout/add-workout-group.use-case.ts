import type { WorkoutGroup } from "../../domain/workout/workout-group.entity";
import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";

export class AddWorkoutGroupUseCase {
  constructor(private readonly groupRepository: IWorkoutGroupRepository) {}

  async execute(
    workoutPlanId: string,
    label: string,
    displayOrder: number,
  ): Promise<WorkoutGroup> {
    return this.groupRepository.create(workoutPlanId, label, displayOrder);
  }
}
