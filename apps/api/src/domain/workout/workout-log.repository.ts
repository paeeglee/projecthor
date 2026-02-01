import type { WorkoutLog } from "./workout-log.entity";

export interface IWorkoutLogRepository {
  create(data: {
    workoutExerciseId: string;
    athleteId: string;
    setsCompleted: number;
    repsCompleted: number;
    weight: number;
    notes?: string;
    workoutSessionId?: string;
  }): Promise<WorkoutLog>;
  findByWorkoutExerciseId(workoutExerciseId: string): Promise<WorkoutLog[]>;
  findBySessionId(sessionId: string): Promise<WorkoutLog[]>;
}
