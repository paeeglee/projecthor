import { ConfirmResetPasswordUseCase } from "./application/auth/confirm-reset-password.use-case";
import { ResetPasswordUseCase } from "./application/auth/reset-password.use-case";
import { RevalidateUseCase } from "./application/auth/revalidate.use-case";
import { SignInUseCase } from "./application/auth/sign-in.use-case";
import { SignUpUseCase } from "./application/auth/sign-up.use-case";
import { GetExerciseBySlugUseCase } from "./application/exercise/get-exercise-by-slug.use-case";
import { GetHealthStatusUseCase } from "./application/health/get-health-status.use-case";
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

export const container = {
  getHealthStatusUseCase,
  signUpUseCase,
  signInUseCase,
  revalidateUseCase,
  resetPasswordUseCase,
  confirmResetPasswordUseCase,
  getExerciseBySlugUseCase,
};
