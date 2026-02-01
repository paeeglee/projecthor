import type { Exercise } from "./exercise.entity";

export interface IExerciseRepository {
  findBySlug(slug: string): Promise<Exercise | null>;
  findByIds(ids: string[]): Promise<Exercise[]>;
  listAll(): Promise<Exercise[]>;
}
