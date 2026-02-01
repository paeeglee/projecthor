import type {
  IMuscleGroupChartRepository,
  MuscleGroupChartEntry,
} from "../../domain/dashboard/muscle-group-chart.repository";

export class GetMuscleGroupChartUseCase {
  constructor(
    private readonly muscleGroupChartRepository: IMuscleGroupChartRepository,
  ) {}

  async execute(
    athleteId: string,
  ): Promise<{ muscleGroups: MuscleGroupChartEntry[] }> {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    since.setHours(0, 0, 0, 0);

    const muscleGroups =
      await this.muscleGroupChartRepository.getMuscleGroupChart(
        athleteId,
        since,
      );

    return { muscleGroups };
  }
}
