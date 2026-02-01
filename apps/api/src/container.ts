import { GenerateWorkoutUseCase } from "./application/ai/generate-workout.use-case";
import { CreateGroupUseCase } from "./application/anamnesis/create-group.use-case";
import { CreateQuestionUseCase } from "./application/anamnesis/create-question.use-case";
import { CreateTemplateUseCase } from "./application/anamnesis/create-template.use-case";
import { DeleteGroupUseCase } from "./application/anamnesis/delete-group.use-case";
import { DeleteQuestionUseCase } from "./application/anamnesis/delete-question.use-case";
import { GetFormSchemaUseCase } from "./application/anamnesis/get-form-schema.use-case";
import { GetTemplateUseCase } from "./application/anamnesis/get-template.use-case";
import { SubmitResponseUseCase } from "./application/anamnesis/submit-response.use-case";
import { UpdateGroupUseCase } from "./application/anamnesis/update-group.use-case";
import { UpdateQuestionUseCase } from "./application/anamnesis/update-question.use-case";
import { UpdateTemplateUseCase } from "./application/anamnesis/update-template.use-case";
import { ConfirmResetPasswordUseCase } from "./application/auth/confirm-reset-password.use-case";
import { ResetPasswordUseCase } from "./application/auth/reset-password.use-case";
import { RevalidateUseCase } from "./application/auth/revalidate.use-case";
import { SignInUseCase } from "./application/auth/sign-in.use-case";
import { SignUpUseCase } from "./application/auth/sign-up.use-case";
import { GetMuscleGroupChartUseCase } from "./application/dashboard/get-muscle-group-chart.use-case";
import { GetWeekGoalsUseCase } from "./application/dashboard/get-week-goals.use-case";
import { GetWorkoutSummaryUseCase } from "./application/dashboard/get-workout-summary.use-case";
import { GetExerciseBySlugUseCase } from "./application/exercise/get-exercise-by-slug.use-case";
import { GetHealthStatusUseCase } from "./application/health/get-health-status.use-case";
import { AddExerciseToGroupUseCase } from "./application/workout/add-exercise-to-group.use-case";
import { AddWorkoutGroupUseCase } from "./application/workout/add-workout-group.use-case";
import { CreateWorkoutPlanUseCase } from "./application/workout/create-workout-plan.use-case";
import { DeactivateWorkoutPlanUseCase } from "./application/workout/deactivate-workout-plan.use-case";
import { FinishWorkoutSessionUseCase } from "./application/workout/finish-workout-session.use-case";
import { GetGroupExercisesUseCase } from "./application/workout/get-group-exercises.use-case";
import { GetWorkoutHistoryUseCase } from "./application/workout/get-workout-history.use-case";
import { GetWorkoutPlanUseCase } from "./application/workout/get-workout-plan.use-case";
import { LogWorkoutUseCase } from "./application/workout/log-workout.use-case";
import { RemoveExerciseFromGroupUseCase } from "./application/workout/remove-exercise-from-group.use-case";
import { RemoveWorkoutGroupUseCase } from "./application/workout/remove-workout-group.use-case";
import { UpdateGroupExerciseUseCase } from "./application/workout/update-group-exercise.use-case";
import { UpdateWorkoutGroupUseCase } from "./application/workout/update-workout-group.use-case";
import { UpdateWorkoutPlanUseCase } from "./application/workout/update-workout-plan.use-case";
import { MockAiClientRepository } from "./infrastructure/ai/mock-client.repository";
import { AnamnesisGroupRepository } from "./infrastructure/anamnesis/anamnesis-group.repository";
import { AnamnesisQuestionRepository } from "./infrastructure/anamnesis/anamnesis-question.repository";
import { AnamnesisResponseRepository } from "./infrastructure/anamnesis/anamnesis-response.repository";
import { AnamnesisTemplateRepository } from "./infrastructure/anamnesis/anamnesis-template.repository";
import { AuthRepository } from "./infrastructure/auth/auth.repository";
import { AuthMiddlewareRepository } from "./infrastructure/auth/auth-middleware.repository";
import { env } from "./infrastructure/config/env";
import { MuscleGroupChartRepository } from "./infrastructure/dashboard/muscle-group-chart.repository";
import { WeekGoalsRepository } from "./infrastructure/dashboard/week-goals.repository";
import { WorkoutSummaryRepository } from "./infrastructure/dashboard/workout-summary.repository";
import { ExerciseRepository } from "./infrastructure/exercise/exercise.repository";
import { HealthRepository } from "./infrastructure/health/health.repository";
import { supabase, supabaseAdmin } from "./infrastructure/supabase/client";
import { WorkoutExerciseRepository } from "./infrastructure/workout/workout-exercise.repository";
import { WorkoutGroupRepository } from "./infrastructure/workout/workout-group.repository";
import { WorkoutLogRepository } from "./infrastructure/workout/workout-log.repository";
import { WorkoutPlanRepository } from "./infrastructure/workout/workout-plan.repository";
import { WorkoutSessionRepository } from "./infrastructure/workout/workout-session.repository";

const healthRepository = new HealthRepository();
const getHealthStatusUseCase = new GetHealthStatusUseCase(healthRepository);

const authMiddlewareRepository = new AuthMiddlewareRepository(supabaseAdmin);
const authRepository = new AuthRepository(supabase);
const anamnesisResponseRepository = new AnamnesisResponseRepository(
  supabaseAdmin,
);
const signUpUseCase = new SignUpUseCase(authRepository);
const signInUseCase = new SignInUseCase(
  authRepository,
  anamnesisResponseRepository,
);
const revalidateUseCase = new RevalidateUseCase(authRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
const confirmResetPasswordUseCase = new ConfirmResetPasswordUseCase(
  authRepository,
);

const exerciseRepository = new ExerciseRepository(supabaseAdmin);
const getExerciseBySlugUseCase = new GetExerciseBySlugUseCase(
  exerciseRepository,
);

const anamnesisTemplateRepository = new AnamnesisTemplateRepository(
  supabaseAdmin,
);
const anamnesisGroupRepository = new AnamnesisGroupRepository(supabaseAdmin);
const anamnesisQuestionRepository = new AnamnesisQuestionRepository(
  supabaseAdmin,
);

const createTemplateUseCase = new CreateTemplateUseCase(
  anamnesisTemplateRepository,
);
const getTemplateUseCase = new GetTemplateUseCase(
  anamnesisTemplateRepository,
  anamnesisGroupRepository,
  anamnesisQuestionRepository,
);
const updateTemplateUseCase = new UpdateTemplateUseCase(
  anamnesisTemplateRepository,
);
const createGroupUseCase = new CreateGroupUseCase(
  anamnesisGroupRepository,
  anamnesisTemplateRepository,
  anamnesisQuestionRepository,
);
const updateGroupUseCase = new UpdateGroupUseCase(
  anamnesisGroupRepository,
  anamnesisTemplateRepository,
  anamnesisQuestionRepository,
);
const deleteGroupUseCase = new DeleteGroupUseCase(
  anamnesisGroupRepository,
  anamnesisTemplateRepository,
  anamnesisQuestionRepository,
);
const createQuestionUseCase = new CreateQuestionUseCase(
  anamnesisQuestionRepository,
  anamnesisGroupRepository,
  anamnesisTemplateRepository,
);
const updateQuestionUseCase = new UpdateQuestionUseCase(
  anamnesisQuestionRepository,
  anamnesisGroupRepository,
  anamnesisTemplateRepository,
);
const deleteQuestionUseCase = new DeleteQuestionUseCase(
  anamnesisQuestionRepository,
  anamnesisGroupRepository,
  anamnesisTemplateRepository,
);
const getFormSchemaUseCase = new GetFormSchemaUseCase(
  anamnesisTemplateRepository,
);
const submitResponseUseCase = new SubmitResponseUseCase(
  anamnesisResponseRepository,
  anamnesisTemplateRepository,
);

const workoutPlanRepository = new WorkoutPlanRepository(supabaseAdmin);
const workoutGroupRepository = new WorkoutGroupRepository(supabaseAdmin);
const workoutExerciseRepository = new WorkoutExerciseRepository(supabaseAdmin);
const workoutLogRepository = new WorkoutLogRepository(supabaseAdmin);
const workoutSessionRepository = new WorkoutSessionRepository(supabaseAdmin);

const weekGoalsRepository = new WeekGoalsRepository(supabaseAdmin);
const getWeekGoalsUseCase = new GetWeekGoalsUseCase(weekGoalsRepository);

const workoutSummaryRepository = new WorkoutSummaryRepository(supabaseAdmin);
const getWorkoutSummaryUseCase = new GetWorkoutSummaryUseCase(
  workoutSummaryRepository,
);

const muscleGroupChartRepository = new MuscleGroupChartRepository(
  supabaseAdmin,
);
const getMuscleGroupChartUseCase = new GetMuscleGroupChartUseCase(
  muscleGroupChartRepository,
);

const createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(
  workoutPlanRepository,
);
const getWorkoutPlanUseCase = new GetWorkoutPlanUseCase(
  workoutPlanRepository,
  workoutGroupRepository,
  workoutExerciseRepository,
  exerciseRepository,
);
const updateWorkoutPlanUseCase = new UpdateWorkoutPlanUseCase(
  workoutPlanRepository,
);
const deactivateWorkoutPlanUseCase = new DeactivateWorkoutPlanUseCase(
  workoutPlanRepository,
);
const addWorkoutGroupUseCase = new AddWorkoutGroupUseCase(
  workoutGroupRepository,
);
const updateWorkoutGroupUseCase = new UpdateWorkoutGroupUseCase(
  workoutGroupRepository,
);
const removeWorkoutGroupUseCase = new RemoveWorkoutGroupUseCase(
  workoutGroupRepository,
);
const addExerciseToGroupUseCase = new AddExerciseToGroupUseCase(
  workoutExerciseRepository,
);
const updateGroupExerciseUseCase = new UpdateGroupExerciseUseCase(
  workoutExerciseRepository,
);
const removeExerciseFromGroupUseCase = new RemoveExerciseFromGroupUseCase(
  workoutExerciseRepository,
);
const logWorkoutUseCase = new LogWorkoutUseCase(workoutLogRepository);
const finishWorkoutSessionUseCase = new FinishWorkoutSessionUseCase(
  workoutSessionRepository,
  workoutLogRepository,
);
const getWorkoutHistoryUseCase = new GetWorkoutHistoryUseCase(
  workoutLogRepository,
);
const getGroupExercisesUseCase = new GetGroupExercisesUseCase(
  workoutGroupRepository,
  workoutExerciseRepository,
  exerciseRepository,
);

const mockAiClientRepository = new MockAiClientRepository();
const generateWorkoutUseCase = new GenerateWorkoutUseCase(
  mockAiClientRepository,
  anamnesisResponseRepository,
  anamnesisQuestionRepository,
  exerciseRepository,
  workoutPlanRepository,
  workoutGroupRepository,
  workoutExerciseRepository,
);

export const container = {
  authMiddlewareRepository,
  getHealthStatusUseCase,
  signUpUseCase,
  signInUseCase,
  revalidateUseCase,
  resetPasswordUseCase,
  confirmResetPasswordUseCase,
  getExerciseBySlugUseCase,
  createTemplateUseCase,
  getTemplateUseCase,
  updateTemplateUseCase,
  createGroupUseCase,
  updateGroupUseCase,
  deleteGroupUseCase,
  createQuestionUseCase,
  updateQuestionUseCase,
  deleteQuestionUseCase,
  getFormSchemaUseCase,
  submitResponseUseCase,
  createWorkoutPlanUseCase,
  getWorkoutPlanUseCase,
  updateWorkoutPlanUseCase,
  deactivateWorkoutPlanUseCase,
  addWorkoutGroupUseCase,
  updateWorkoutGroupUseCase,
  removeWorkoutGroupUseCase,
  addExerciseToGroupUseCase,
  updateGroupExerciseUseCase,
  removeExerciseFromGroupUseCase,
  logWorkoutUseCase,
  finishWorkoutSessionUseCase,
  getWorkoutHistoryUseCase,
  getGroupExercisesUseCase,
  generateWorkoutUseCase,
  getWeekGoalsUseCase,
  getWorkoutSummaryUseCase,
  getMuscleGroupChartUseCase,
};
