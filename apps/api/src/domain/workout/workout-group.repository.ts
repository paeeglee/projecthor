import type { WorkoutGroup } from "./workout-group.entity";

export interface IWorkoutGroupRepository {
  create(
    workoutPlanId: string,
    label: string,
    displayOrder: number,
  ): Promise<WorkoutGroup>;
  findByPlanId(workoutPlanId: string): Promise<WorkoutGroup[]>;
  findById(id: string): Promise<WorkoutGroup | null>;
  update(
    id: string,
    data: { label?: string; displayOrder?: number },
  ): Promise<WorkoutGroup>;
  delete(id: string): Promise<void>;
}
