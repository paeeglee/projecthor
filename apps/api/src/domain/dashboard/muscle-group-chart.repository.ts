export interface MuscleGroupChartEntry {
  name: string;
  averageWeight: number;
}

export interface IMuscleGroupChartRepository {
  getMuscleGroupChart(
    athleteId: string,
    since: Date,
  ): Promise<MuscleGroupChartEntry[]>;
}
