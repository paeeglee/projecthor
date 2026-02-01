import type { Profile } from "./profile.entity";

export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  create(
    userId: string,
    fullName: string,
    bodyWeight?: number,
  ): Promise<Profile>;
  updateBodyWeight(userId: string, bodyWeight: number): Promise<Profile>;
}
