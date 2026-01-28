import type { WorkoutLog } from "../../domain/workout/workout-log.entity";
import type { IWorkoutLogRepository } from "../../domain/workout/workout-log.repository";

export class LogWorkoutUseCase {
  constructor(private readonly logRepository: IWorkoutLogRepository) {}

  async execute(data: {
    workoutExerciseId: string;
    athleteId: string;
    setsCompleted: number;
    repsCompleted: number;
    weight: number;
    notes?: string;
  }): Promise<WorkoutLog> {
    return this.logRepository.create(data);
  }
}
