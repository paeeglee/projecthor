import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { AuthTokens } from "../../domain/auth/auth.types";

export class RevalidateUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    return this.authRepository.refreshSession(refreshToken);
  }
}
