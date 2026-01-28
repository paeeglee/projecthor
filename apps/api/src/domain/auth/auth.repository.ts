import type { AuthTokens, SignUpResult } from "./auth.types";

export interface IAuthRepository {
  signUp(email: string, password: string): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<AuthTokens>;
  refreshSession(refreshToken: string): Promise<AuthTokens>;
  resetPassword(email: string): Promise<void>;
  confirmResetPassword(token: string, password: string): Promise<void>;
}
