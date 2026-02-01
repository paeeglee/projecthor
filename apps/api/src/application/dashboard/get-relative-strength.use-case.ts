import type { IProfileRepository } from "../../domain/profile/profile.repository";
import type {
  IRelativeStrengthRepository,
  WorkoutLogWithExercise,
} from "../../domain/dashboard/relative-strength.repository";
import {
  classifyMovementPattern,
  type MovementPattern,
} from "../../domain/dashboard/movement-pattern";

interface PatternBreakdown {
  pattern: MovementPattern;
  fr: number;
}

interface WeeklyEntry {
  weekStart: string;
  igfr: number;
}

interface RelativeStrengthResult {
  score: number;
  trend: "up" | "down" | "stable";
  trendDelta: number;
  bodyWeightStale: boolean;
  breakdown: PatternBreakdown[];
  weeklyHistory: WeeklyEntry[];
}

export class GetRelativeStrengthUseCase {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly relativeStrengthRepository: IRelativeStrengthRepository,
  ) {}

  async execute(athleteId: string): Promise<RelativeStrengthResult | null> {
    const profile = await this.profileRepository.findByUserId(athleteId);
    if (!profile) return null;

    const bodyWeight = profile.bodyWeight;
    const now = new Date();

    const staleThreshold = new Date(now);
    staleThreshold.setDate(staleThreshold.getDate() - 14);
    const bodyWeightStale = profile.bodyWeightUpdatedAt < staleThreshold;

    const currentSince = new Date(now);
    currentSince.setDate(currentSince.getDate() - 14);
    currentSince.setHours(0, 0, 0, 0);

    const prevSince = new Date(now);
    prevSince.setDate(prevSince.getDate() - 28);
    prevSince.setHours(0, 0, 0, 0);

    const allLogs =
      await this.relativeStrengthRepository.getAllLogsWithExerciseMetadata(
        athleteId,
      );

    const currentLogs = allLogs.filter((l) => l.completedAt >= currentSince);
    const prevLogs = allLogs.filter(
      (l) => l.completedAt >= prevSince && l.completedAt < currentSince,
    );

    const currentBreakdown = this.computeBreakdown(currentLogs, bodyWeight);
    const currentIGFR = this.computeIGFR(currentBreakdown);

    if (currentBreakdown.length === 0) return null;

    const prevBreakdown = this.computeBreakdown(prevLogs, bodyWeight);
    const prevIGFR = this.computeIGFR(prevBreakdown);

    const weeklyHistory = this.computeWeeklyHistory(allLogs, bodyWeight);
    const igfrRef = this.computeReference(weeklyHistory);

    const score = igfrRef > 0 ? Math.round((currentIGFR / igfrRef) * 100) : 100;

    let trend: "up" | "down" | "stable" = "stable";
    let trendDelta = 0;
    if (prevIGFR > 0) {
      const prevScore = Math.round((prevIGFR / igfrRef) * 100);
      trendDelta = score - prevScore;
      if (trendDelta > 2) trend = "up";
      else if (trendDelta < -2) trend = "down";
    }

    return {
      score,
      trend,
      trendDelta,
      bodyWeightStale,
      breakdown: currentBreakdown,
      weeklyHistory,
    };
  }

  private computeBreakdown(
    logs: WorkoutLogWithExercise[],
    bodyWeight: number,
  ): PatternBreakdown[] {
    const patternFRs = new Map<MovementPattern, number[]>();

    for (const log of logs) {
      const pattern = classifyMovementPattern({
        force: log.exerciseForce,
        primaryMuscles: log.exercisePrimaryMuscles,
        category: log.exerciseCategory,
      });
      if (!pattern) continue;

      const fr = (log.weight * log.repsCompleted) / bodyWeight;
      if (!patternFRs.has(pattern)) patternFRs.set(pattern, []);
      patternFRs.get(pattern)!.push(fr);
    }

    return [...patternFRs.entries()].map(([pattern, frs]) => ({
      pattern,
      fr: Math.round((frs.reduce((a, b) => a + b, 0) / frs.length) * 100) / 100,
    }));
  }

  private computeIGFR(breakdown: PatternBreakdown[]): number {
    if (breakdown.length === 0) return 0;
    return breakdown.reduce((sum, b) => sum + b.fr, 0) / breakdown.length;
  }

  private computeWeeklyHistory(
    logs: WorkoutLogWithExercise[],
    bodyWeight: number,
  ): WeeklyEntry[] {
    const weekMap = new Map<string, WorkoutLogWithExercise[]>();

    for (const log of logs) {
      const weekStart = this.getWeekStart(log.completedAt);
      const key = weekStart.toISOString().split("T")[0];
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key)!.push(log);
    }

    const entries: WeeklyEntry[] = [];
    for (const [weekStart, weekLogs] of weekMap) {
      const breakdown = this.computeBreakdown(weekLogs, bodyWeight);
      const igfr = this.computeIGFR(breakdown);
      if (breakdown.length > 0) {
        entries.push({
          weekStart,
          igfr: Math.round(igfr * 100) / 100,
        });
      }
    }

    return entries.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }

  private computeReference(weeklyHistory: WeeklyEntry[]): number {
    if (weeklyHistory.length === 0) return 0;
    if (weeklyHistory.length <= 4) {
      return (
        weeklyHistory.reduce((sum, w) => sum + w.igfr, 0) / weeklyHistory.length
      );
    }

    let bestAvg = 0;
    for (let i = 0; i <= weeklyHistory.length - 4; i++) {
      const window = weeklyHistory.slice(i, i + 4);
      const avg = window.reduce((sum, w) => sum + w.igfr, 0) / 4;
      if (avg > bestAvg) bestAvg = avg;
    }
    return bestAvg;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
