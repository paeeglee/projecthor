import { Elysia } from "elysia";
import { container } from "./container";
import { env } from "./infrastructure/config/env";
import { anamnesisPlugin } from "./presentation/anamnesis/anamnesis.plugin";
import { authPlugin } from "./presentation/auth/auth.plugin";
import { exercisePlugin } from "./presentation/exercise/exercise.plugin";
import { healthPlugin } from "./presentation/health/health.plugin";
import { workoutPlugin } from "./presentation/workout/workout.plugin";

const port = Number(env.PORT);

new Elysia()
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
  .use(exercisePlugin(container.getExerciseBySlugUseCase))
  .use(
    anamnesisPlugin({
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
