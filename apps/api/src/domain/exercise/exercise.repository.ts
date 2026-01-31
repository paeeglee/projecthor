import type { Exercise } from "./exercise.entity";

export interface IExerciseRepository {
  findBySlug(slug: string): Promise<Exercise | null>;
  listAll(): Promise<Exercise[]>;
}
