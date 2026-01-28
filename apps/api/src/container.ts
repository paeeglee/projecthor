import { ConfirmResetPasswordUseCase } from "./application/auth/confirm-reset-password.use-case";
import { ResetPasswordUseCase } from "./application/auth/reset-password.use-case";
import { RevalidateUseCase } from "./application/auth/revalidate.use-case";
import { SignInUseCase } from "./application/auth/sign-in.use-case";
import { SignUpUseCase } from "./application/auth/sign-up.use-case";
import { GetHealthStatusUseCase } from "./application/health/get-health-status.use-case";
import { AuthRepository } from "./infrastructure/auth/auth.repository";
import { HealthRepository } from "./infrastructure/health/health.repository";
import { supabase } from "./infrastructure/supabase/client";

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

export const container = {
  getHealthStatusUseCase,
  signUpUseCase,
  signInUseCase,
  revalidateUseCase,
  resetPasswordUseCase,
  confirmResetPasswordUseCase,
};
