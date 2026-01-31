import type { IAnamnesisResponseRepository } from "../../domain/anamnesis/anamnesis-response.repository";
import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { SignInResult } from "../../domain/auth/auth.types";

export class SignInUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly anamnesisResponseRepository: IAnamnesisResponseRepository,
  ) {}

  async execute(email: string, password: string): Promise<SignInResult> {
    const { user, accessToken, refreshToken } =
      await this.authRepository.signIn(email, password);

    const hasAnamnesis =
      await this.anamnesisResponseRepository.existsByAthleteId(user.id);

    return {
      user: { ...user, hasAnamnesis },
      accessToken,
      refreshToken,
    };
  }
}
