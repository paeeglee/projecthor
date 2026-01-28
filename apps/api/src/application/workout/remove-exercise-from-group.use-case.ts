import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";

export class RemoveExerciseFromGroupUseCase {
  constructor(
    private readonly exerciseRepository: IWorkoutExerciseRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return this.exerciseRepository.delete(id);
  }
}
