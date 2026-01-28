import type { WorkoutPlan } from "./workout-plan.entity";

export interface IWorkoutPlanRepository {
  create(athleteId: string, name: string): Promise<WorkoutPlan>;
  findActiveByAthleteId(athleteId: string): Promise<WorkoutPlan | null>;
  findById(id: string): Promise<WorkoutPlan | null>;
  update(id: string, data: { name?: string }): Promise<WorkoutPlan>;
  deactivate(id: string): Promise<void>;
  deactivateAllByAthleteId(athleteId: string): Promise<void>;
}
