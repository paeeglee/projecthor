import type {
  IWeekGoalsRepository,
  WeekGoalsData,
} from "../../domain/dashboard/week-goals.repository";

export class GetWeekGoalsUseCase {
  constructor(private readonly weekGoalsRepository: IWeekGoalsRepository) {}

  async execute(athleteId: string): Promise<WeekGoalsData> {
    const now = new Date();

    // Week starts on Sunday
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return this.weekGoalsRepository.getWeekGoals(athleteId, weekStart, weekEnd);
  }
}
