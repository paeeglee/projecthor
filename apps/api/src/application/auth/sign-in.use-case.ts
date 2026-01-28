import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { AuthTokens } from "../../domain/auth/auth.types";

export class SignInUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<AuthTokens> {
    return this.authRepository.signIn(email, password);
  }
}
