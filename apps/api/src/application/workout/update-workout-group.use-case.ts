import type { WorkoutGroup } from "../../domain/workout/workout-group.entity";
import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";

export class UpdateWorkoutGroupUseCase {
  constructor(private readonly groupRepository: IWorkoutGroupRepository) {}

  async execute(
    id: string,
    data: { label?: string; displayOrder?: number },
  ): Promise<WorkoutGroup> {
    return this.groupRepository.update(id, data);
  }
}
