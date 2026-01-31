import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { container } from "./container";
import { env } from "./infrastructure/config/env";
import { anamnesisPlugin } from "./presentation/anamnesis/anamnesis.plugin";
import { authMiddlewarePlugin } from "./presentation/auth/auth-middleware.plugin";
import { authPlugin } from "./presentation/auth/auth.plugin";
import { exercisePlugin } from "./presentation/exercise/exercise.plugin";
import { healthPlugin } from "./presentation/health/health.plugin";
import { workoutPlugin } from "./presentation/workout/workout.plugin";

const port = Number(env.PORT);
const authMiddleware = authMiddlewarePlugin(container.authMiddlewareRepository);

new Elysia()
  .use(cors({ origin: "http://localhost:5173" }))
  .use(healthPlugin(container.getHealthStatusUseCase))
  .use(
    authPlugin({
      signUp: container.signUpUseCase,
      signIn: container.signInUseCase,
      revalidate: container.revalidateUseCase,
      resetPassword: container.resetPasswordUseCase,
      confirmResetPassword: container.confirmResetPasswordUseCase,
    }),
  )
  // Auth middleware (protects all routes registered after this point)
  .use(authMiddleware)
  // Protected routes
  .use(
    exercisePlugin({
      authMiddleware,
      useCase: container.getExerciseBySlugUseCase,
    }),
  )
  .use(
    anamnesisPlugin({
      authMiddleware,
      createTemplate: container.createTemplateUseCase,
      getTemplate: container.getTemplateUseCase,
      updateTemplate: container.updateTemplateUseCase,
      createGroup: container.createGroupUseCase,
      updateGroup: container.updateGroupUseCase,
      deleteGroup: container.deleteGroupUseCase,
      createQuestion: container.createQuestionUseCase,
      updateQuestion: container.updateQuestionUseCase,
      deleteQuestion: container.deleteQuestionUseCase,
      getFormSchema: container.getFormSchemaUseCase,
      submitResponse: container.submitResponseUseCase,
    }),
  )
  .use(
    workoutPlugin({
      authMiddleware,
      createPlan: container.createWorkoutPlanUseCase,
      getPlan: container.getWorkoutPlanUseCase,
      updatePlan: container.updateWorkoutPlanUseCase,
      deactivatePlan: container.deactivateWorkoutPlanUseCase,
      addGroup: container.addWorkoutGroupUseCase,
      updateGroup: container.updateWorkoutGroupUseCase,
      removeGroup: container.removeWorkoutGroupUseCase,
      addExercise: container.addExerciseToGroupUseCase,
      updateExercise: container.updateGroupExerciseUseCase,
      removeExercise: container.removeExerciseFromGroupUseCase,
      logWorkout: container.logWorkoutUseCase,
      getHistory: container.getWorkoutHistoryUseCase,
    }),
  )
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
