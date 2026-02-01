export interface WorkoutSummaryData {
  lastWorkout: {
    groupLabel: string;
    completedAt: string;
  } | null;
  nextWorkout: {
    groupId: string;
    groupLabel: string;
  } | null;
}

export interface IWorkoutSummaryRepository {
  getWorkoutSummary(athleteId: string): Promise<WorkoutSummaryData>;
}
