import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { SignUpResult } from "../../domain/auth/auth.types";

export class SignUpUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<SignUpResult> {
    return this.authRepository.signUp(email, password);
  }
}
