export interface WorkoutLog {
  id: string;
  workoutExerciseId: string;
  athleteId: string;
  setsCompleted: number;
  repsCompleted: number;
  weight: number;
  notes: string | null;
  workoutSessionId: string | null;
  completedAt: Date;
  createdAt: Date;
}
