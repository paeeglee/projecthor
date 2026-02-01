export interface WorkoutLogWithExercise {
  weight: number;
  repsCompleted: number;
  completedAt: Date;
  exerciseForce: string | null;
  exercisePrimaryMuscles: string[];
  exerciseCategory: string;
}

export interface IRelativeStrengthRepository {
  getLogsWithExerciseMetadata(
    athleteId: string,
    since: Date,
  ): Promise<WorkoutLogWithExercise[]>;

  getAllLogsWithExerciseMetadata(
    athleteId: string,
  ): Promise<WorkoutLogWithExercise[]>;
}
