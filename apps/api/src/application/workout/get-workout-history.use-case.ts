import type { WorkoutLog } from "../../domain/workout/workout-log.entity";
import type { IWorkoutLogRepository } from "../../domain/workout/workout-log.repository";

export class GetWorkoutHistoryUseCase {
  constructor(private readonly logRepository: IWorkoutLogRepository) {}

  async execute(workoutExerciseId: string): Promise<WorkoutLog[]> {
    return this.logRepository.findByWorkoutExerciseId(workoutExerciseId);
  }
}
