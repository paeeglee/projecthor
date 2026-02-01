export interface WorkoutSession {
  id: string;
  workoutGroupId: string;
  athleteId: string;
  durationSeconds: number | null;
  finishedAt: Date;
  createdAt: Date;
}
