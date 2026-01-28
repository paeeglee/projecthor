import type { IWorkoutPlanRepository } from "../../domain/workout/workout-plan.repository";

export class DeactivateWorkoutPlanUseCase {
  constructor(private readonly planRepository: IWorkoutPlanRepository) {}

  async execute(id: string): Promise<void> {
    return this.planRepository.deactivate(id);
  }
}
