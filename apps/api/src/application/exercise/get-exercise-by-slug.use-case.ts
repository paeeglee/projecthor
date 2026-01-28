import type { Exercise } from "../../domain/exercise/exercise.entity";
import type { IExerciseRepository } from "../../domain/exercise/exercise.repository";

export class GetExerciseBySlugUseCase {
  constructor(private readonly exerciseRepository: IExerciseRepository) {}

  async execute(slug: string): Promise<Exercise | null> {
    return this.exerciseRepository.findBySlug(slug);
  }
}
