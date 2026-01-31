export interface WorkoutExercise {
  id: string;
  workoutGroupId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number | null;
  notes: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
