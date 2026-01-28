import type { WorkoutPlan } from "../../domain/workout/workout-plan.entity";
import type { IWorkoutPlanRepository } from "../../domain/workout/workout-plan.repository";

export class UpdateWorkoutPlanUseCase {
  constructor(private readonly planRepository: IWorkoutPlanRepository) {}

  async execute(id: string, name: string): Promise<WorkoutPlan> {
    return this.planRepository.update(id, { name });
  }
}
