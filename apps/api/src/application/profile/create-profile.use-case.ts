import type { IProfileRepository } from "../../domain/profile/profile.repository";

export class CreateProfileUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string, fullName: string, bodyWeight?: number) {
    const existing = await this.profileRepository.findByUserId(userId);
    if (existing) return existing;
    return this.profileRepository.create(userId, fullName, bodyWeight);
  }
}
