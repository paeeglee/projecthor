import type {
  IWorkoutSummaryRepository,
  WorkoutSummaryData,
} from "../../domain/dashboard/workout-summary.repository";

export class GetWorkoutSummaryUseCase {
  constructor(
    private readonly workoutSummaryRepository: IWorkoutSummaryRepository,
  ) {}

  async execute(athleteId: string): Promise<WorkoutSummaryData> {
    return this.workoutSummaryRepository.getWorkoutSummary(athleteId);
  }
}
