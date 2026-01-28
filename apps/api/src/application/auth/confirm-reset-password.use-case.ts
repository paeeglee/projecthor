import type { IAuthRepository } from "../../domain/auth/auth.repository";

export class ConfirmResetPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(token: string, password: string): Promise<void> {
    return this.authRepository.confirmResetPassword(token, password);
  }
}
