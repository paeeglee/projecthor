import type { WorkoutExercise } from "../../domain/workout/workout-exercise.entity";
import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";

export class UpdateGroupExerciseUseCase {
  constructor(
    private readonly exerciseRepository: IWorkoutExerciseRepository,
  ) {}

  async execute(
    id: string,
    data: { sets?: number; reps?: number; displayOrder?: number },
  ): Promise<WorkoutExercise> {
    return this.exerciseRepository.update(id, data);
  }
}
