import { Elysia } from "elysia";
import type { ConfirmResetPasswordUseCase } from "../../application/auth/confirm-reset-password.use-case";
import type { ResetPasswordUseCase } from "../../application/auth/reset-password.use-case";
import type { RevalidateUseCase } from "../../application/auth/revalidate.use-case";
import type { SignInUseCase } from "../../application/auth/sign-in.use-case";
import type { SignUpUseCase } from "../../application/auth/sign-up.use-case";
import {
  ConfirmResetPasswordBody,
  ResetPasswordBody,
  RevalidateBody,
  SignInBody,
  SignUpBody,
} from "./auth.schemas";

interface AuthUseCases {
  signUp: SignUpUseCase;
  signIn: SignInUseCase;
  revalidate: RevalidateUseCase;
  resetPassword: ResetPasswordUseCase;
  confirmResetPassword: ConfirmResetPasswordUseCase;
}

export const authPlugin = (useCases: AuthUseCases) =>
  new Elysia({ prefix: "/auth" })
    .post(
      "/signup",
      async ({ body, set }) => {
        try {
          const result = await useCases.signUp.execute(
            body.email,
            body.password,
          );
          set.status = 201;
          return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          };
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message?.includes("already registered")
          ) {
            set.status = 409;
            return { error: "Email already registered" };
          }
          throw error;
        }
      },
      { body: SignUpBody },
    )
    .post(
      "/signin",
      async ({ body, set }) => {
        try {
          const tokens = await useCases.signIn.execute(
            body.email,
            body.password,
          );
          return tokens;
        } catch {
          set.status = 401;
          return { error: "Invalid credentials" };
        }
      },
      { body: SignInBody },
    )
    .post(
      "/revalidate",
      async ({ body, set }) => {
        try {
          const tokens = await useCases.revalidate.execute(body.refreshToken);
          return tokens;
        } catch {
          set.status = 401;
          return { error: "Invalid refresh token" };
        }
      },
      { body: RevalidateBody },
    )
    .post(
      "/reset-password",
      async ({ body }) => {
        try {
          await useCases.resetPassword.execute(body.email);
        } catch {
          // Silently ignore errors to prevent user enumeration
        }
        return { message: "If the email exists, a reset link was sent" };
      },
      { body: ResetPasswordBody },
    )
    .post(
      "/reset-password/confirm",
      async ({ body, set }) => {
        try {
          await useCases.confirmResetPassword.execute(
            body.token,
            body.password,
          );
          return { message: "Password reset successfully" };
        } catch {
          set.status = 401;
          return { error: "Invalid or expired token" };
        }
      },
      { body: ConfirmResetPasswordBody },
    );
