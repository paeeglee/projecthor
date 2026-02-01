import type { IProfileRepository } from "../../domain/profile/profile.repository";

export class GetProfileUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string) {
    return this.profileRepository.findByUserId(userId);
  }
}
