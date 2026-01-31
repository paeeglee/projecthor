import { Elysia, t } from "elysia";
import type { GetExerciseBySlugUseCase } from "../../application/exercise/get-exercise-by-slug.use-case";
import type { authMiddlewarePlugin } from "../auth/auth-middleware.plugin";

interface ExercisePluginDeps {
  authMiddleware: ReturnType<typeof authMiddlewarePlugin>;
  useCase: GetExerciseBySlugUseCase;
}

export const exercisePlugin = ({
  authMiddleware,
  useCase,
}: ExercisePluginDeps) =>
  new Elysia({ prefix: "/exercises" }).use(authMiddleware).get(
    "/:slug",
    async ({ params, set }) => {
      const exercise = await useCase.execute(params.slug);

      if (!exercise) {
        set.status = 404;
        return { error: "Exercise not found" };
      }

      return {
        id: exercise.id,
        slug: exercise.slug,
        name: exercise.name,
        force: exercise.force,
        level: exercise.level,
        mechanic: exercise.mechanic,
        equipment: exercise.equipment,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        instructions: exercise.instructions,
        category: exercise.category,
        images: exercise.images,
      };
    },
    {
      params: t.Object({
        slug: t.String({ minLength: 1 }),
      }),
    },
  );
