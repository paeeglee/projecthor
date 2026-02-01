import type { WorkoutSession } from "./workout-session.entity";

export interface IWorkoutSessionRepository {
  create(data: {
    workoutGroupId: string;
    athleteId: string;
  }): Promise<WorkoutSession>;
}
