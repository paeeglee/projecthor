import { Elysia } from "elysia";
import type { GetMuscleGroupChartUseCase } from "../../application/dashboard/get-muscle-group-chart.use-case";
import type { GetRelativeStrengthUseCase } from "../../application/dashboard/get-relative-strength.use-case";
import type { GetWeekGoalsUseCase } from "../../application/dashboard/get-week-goals.use-case";
import type { GetWorkoutSummaryUseCase } from "../../application/dashboard/get-workout-summary.use-case";
import type { authMiddlewarePlugin } from "../auth/auth-middleware.plugin";

interface DashboardUseCases {
  authMiddleware: ReturnType<typeof authMiddlewarePlugin>;
  getWeekGoals: GetWeekGoalsUseCase;
  getWorkoutSummary: GetWorkoutSummaryUseCase;
  getMuscleGroupChart: GetMuscleGroupChartUseCase;
  getRelativeStrength: GetRelativeStrengthUseCase;
}

export const dashboardPlugin = (useCases: DashboardUseCases) =>
  new Elysia({ prefix: "/dashboard" })
    .use(useCases.authMiddleware)
    .get("/week-goals", async ({ user }) => {
      return useCases.getWeekGoals.execute(user.id);
    })
    .get("/workout-summary", async ({ user }) => {
      return useCases.getWorkoutSummary.execute(user.id);
    })
    .get("/muscle-group-chart", async ({ user }) => {
      return useCases.getMuscleGroupChart.execute(user.id);
    })
    .get("/relative-strength", async ({ user }) => {
      return useCases.getRelativeStrength.execute(user.id);
    });
