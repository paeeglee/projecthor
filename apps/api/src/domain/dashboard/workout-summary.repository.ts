export interface WorkoutSummaryData {
  lastWorkout: {
    groupLabel: string;
    completedAt: string;
  } | null;
  nextWorkout: {
    groupLabel: string;
  } | null;
}

export interface IWorkoutSummaryRepository {
  getWorkoutSummary(athleteId: string): Promise<WorkoutSummaryData>;
}
