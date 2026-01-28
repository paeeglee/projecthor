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
import { GetExerciseBySlugUseCase } from "./application/exercise/get-exercise-by-slug.use-case";
import { GetHealthStatusUseCase } from "./application/health/get-health-status.use-case";
import { AnamnesisGroupRepository } from "./infrastructure/anamnesis/anamnesis-group.repository";
import { AnamnesisQuestionRepository } from "./infrastructure/anamnesis/anamnesis-question.repository";
import { AnamnesisResponseRepository } from "./infrastructure/anamnesis/anamnesis-response.repository";
import { AnamnesisTemplateRepository } from "./infrastructure/anamnesis/anamnesis-template.repository";
import { AuthRepository } from "./infrastructure/auth/auth.repository";
import { ExerciseRepository } from "./infrastructure/exercise/exercise.repository";
import { HealthRepository } from "./infrastructure/health/health.repository";
import { supabase, supabaseAdmin } from "./infrastructure/supabase/client";

const healthRepository = new HealthRepository();
const getHealthStatusUseCase = new GetHealthStatusUseCase(healthRepository);

const authRepository = new AuthRepository(supabase);
const signUpUseCase = new SignUpUseCase(authRepository);
const signInUseCase = new SignInUseCase(authRepository);
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
const anamnesisResponseRepository = new AnamnesisResponseRepository(
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

export const container = {
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
};
