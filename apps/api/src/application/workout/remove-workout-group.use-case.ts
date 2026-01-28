import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";

export class RemoveWorkoutGroupUseCase {
  constructor(private readonly groupRepository: IWorkoutGroupRepository) {}

  async execute(id: string): Promise<void> {
    return this.groupRepository.delete(id);
  }
}
