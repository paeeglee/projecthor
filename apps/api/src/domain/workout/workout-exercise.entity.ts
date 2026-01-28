export interface WorkoutExercise {
  id: string;
  workoutGroupId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
