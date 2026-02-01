import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { IProfileRepository } from "../../domain/profile/profile.repository";
import type { SignUpResult } from "../../domain/auth/auth.types";

export class SignUpUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    email: string,
    password: string,
    fullName: string,
  ): Promise<SignUpResult> {
    const result = await this.authRepository.signUp(email, password);
    await this.profileRepository.create(result.user.id, fullName);
    return result;
  }
}
