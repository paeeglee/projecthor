import type { WorkoutExercise } from "./workout-exercise.entity";

export interface IWorkoutExerciseRepository {
  create(data: {
    workoutGroupId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    displayOrder: number;
  }): Promise<WorkoutExercise>;
  findByGroupId(workoutGroupId: string): Promise<WorkoutExercise[]>;
  findById(id: string): Promise<WorkoutExercise | null>;
  update(
    id: string,
    data: { sets?: number; reps?: number; displayOrder?: number },
  ): Promise<WorkoutExercise>;
  delete(id: string): Promise<void>;
}
