import { Type } from "@sinclair/typebox";

export const ExerciseParams = Type.Object({
  slug: Type.String({ minLength: 1 }),
});
