import { Elysia } from "elysia";
import type { GenerateWorkoutUseCase } from "../../application/ai/generate-workout.use-case";
import type { authMiddlewarePlugin } from "../auth/auth-middleware.plugin";
interface AiPluginDeps {
  authMiddleware: ReturnType<typeof authMiddlewarePlugin>;
  generateWorkout: GenerateWorkoutUseCase;
}

export const aiPlugin = ({ authMiddleware, generateWorkout }: AiPluginDeps) =>
  new Elysia({ prefix: "/ai" })
    .use(authMiddleware)
    .post("/generate-workout", async ({ user, set }) => {
      try {
        await generateWorkout.execute(user.id);
        set.status = 201;
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message === "Anamnesis not found for athlete") {
            set.status = 404;
            return { error: error.message };
          }
          if (error.message.startsWith("Exercise not found:")) {
            set.status = 422;
            return { error: error.message };
          }
        }
        throw error;
      }
    });
