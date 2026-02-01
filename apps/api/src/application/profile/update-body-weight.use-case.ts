import type { IProfileRepository } from "../../domain/profile/profile.repository";

export class UpdateBodyWeightUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string, bodyWeight: number) {
    return this.profileRepository.updateBodyWeight(userId, bodyWeight);
  }
}
