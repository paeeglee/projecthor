export interface CompletedDay {
  date: string;
  completed: boolean;
}

export interface WeekGoalsData {
  totalGoal: number;
  completedDays: CompletedDay[];
}

export interface IWeekGoalsRepository {
  getWeekGoals(
    athleteId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<WeekGoalsData>;
}
