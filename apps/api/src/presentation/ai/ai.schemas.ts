import { Type } from "@sinclair/typebox";

export const GeneratedWorkoutResponse = Type.Object({
  name: Type.String(),
  groups: Type.Array(
    Type.Object({
      name: Type.String(),
      exercises: Type.Array(
        Type.Object({
          exerciseSlug: Type.String(),
          sets: Type.Number(),
          reps: Type.String(),
          restSeconds: Type.Number(),
          notes: Type.Optional(Type.String()),
        }),
      ),
    }),
  ),
});
