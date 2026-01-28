import type { WorkoutExercise } from "../../domain/workout/workout-exercise.entity";
import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";

export class AddExerciseToGroupUseCase {
  constructor(
    private readonly exerciseRepository: IWorkoutExerciseRepository,
  ) {}

  async execute(data: {
    workoutGroupId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    displayOrder: number;
  }): Promise<WorkoutExercise> {
    return this.exerciseRepository.create(data);
  }
}
