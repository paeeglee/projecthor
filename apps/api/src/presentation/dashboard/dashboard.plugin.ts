import { Elysia } from "elysia";
import type { GetWeekGoalsUseCase } from "../../application/dashboard/get-week-goals.use-case";
import type { GetWorkoutSummaryUseCase } from "../../application/dashboard/get-workout-summary.use-case";
import type { authMiddlewarePlugin } from "../auth/auth-middleware.plugin";

interface DashboardUseCases {
  authMiddleware: ReturnType<typeof authMiddlewarePlugin>;
  getWeekGoals: GetWeekGoalsUseCase;
  getWorkoutSummary: GetWorkoutSummaryUseCase;
}

export const dashboardPlugin = (useCases: DashboardUseCases) =>
  new Elysia({ prefix: "/dashboard" })
    .use(useCases.authMiddleware)
    .get("/week-goals", async ({ user }) => {
      return useCases.getWeekGoals.execute(user.id);
    })
    .get("/workout-summary", async ({ user }) => {
      return useCases.getWorkoutSummary.execute(user.id);
    });
