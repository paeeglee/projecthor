import type { WorkoutPlan } from "../../domain/workout/workout-plan.entity";
import type { IWorkoutPlanRepository } from "../../domain/workout/workout-plan.repository";

export class CreateWorkoutPlanUseCase {
  constructor(private readonly planRepository: IWorkoutPlanRepository) {}

  async execute(athleteId: string, name: string): Promise<WorkoutPlan> {
    await this.planRepository.deactivateAllByAthleteId(athleteId);
    return this.planRepository.create(athleteId, name);
  }
}
