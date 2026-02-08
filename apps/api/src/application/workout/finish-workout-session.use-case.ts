import type { IWorkoutLogRepository } from "../../domain/workout/workout-log.repository";
import type { WorkoutSession } from "../../domain/workout/workout-session.entity";
import type { IWorkoutSessionRepository } from "../../domain/workout/workout-session.repository";

export class FinishWorkoutSessionUseCase {
  constructor(
    private readonly sessionRepository: IWorkoutSessionRepository,
    private readonly logRepository: IWorkoutLogRepository,
  ) {}

  async execute(data: {
    workoutGroupId: string;
    athleteId: string;
    durationSeconds?: number;
    sets: Array<{
      workoutExerciseId: string;
      repsCompleted: number;
      weight: number;
    }>;
  }): Promise<WorkoutSession> {
    const session = await this.sessionRepository.create({
      workoutGroupId: data.workoutGroupId,
      athleteId: data.athleteId,
      durationSeconds: data.durationSeconds,
    });

    for (const set of data.sets) {
      await this.logRepository.create({
        workoutExerciseId: set.workoutExerciseId,
        athleteId: data.athleteId,
        setsCompleted: 1,
        repsCompleted: set.repsCompleted,
        weight: set.weight,
        workoutSessionId: session.id,
      });
    }

    return session;
  }
}
