import { Type } from "@sinclair/typebox";

export const PlanIdParams = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export const PlanIdNestedParams = Type.Object({
  planId: Type.String({ minLength: 1 }),
});

export const GroupIdParams = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export const GroupIdNestedParams = Type.Object({
  groupId: Type.String({ minLength: 1 }),
});

export const ExerciseIdParams = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export const WorkoutExerciseIdParams = Type.Object({
  workoutExerciseId: Type.String({ minLength: 1 }),
});

export const CreatePlanBody = Type.Object({
  name: Type.String({ minLength: 1 }),
});

export const UpdatePlanBody = Type.Object({
  name: Type.String({ minLength: 1 }),
});

export const CreateGroupBody = Type.Object({
  label: Type.String({ minLength: 1 }),
  displayOrder: Type.Number({ minimum: 0 }),
});

export const UpdateGroupBody = Type.Object(
  {
    label: Type.Optional(Type.String({ minLength: 1 })),
    displayOrder: Type.Optional(Type.Number({ minimum: 0 })),
  },
  { minProperties: 1 },
);

export const AddExerciseBody = Type.Object({
  exerciseId: Type.String({ minLength: 1 }),
  sets: Type.Number({ minimum: 1 }),
  reps: Type.Number({ minimum: 1 }),
  displayOrder: Type.Number({ minimum: 0 }),
});

export const UpdateExerciseBody = Type.Object(
  {
    sets: Type.Optional(Type.Number({ minimum: 1 })),
    reps: Type.Optional(Type.Number({ minimum: 1 })),
    displayOrder: Type.Optional(Type.Number({ minimum: 0 })),
  },
  { minProperties: 1 },
);

export const LogWorkoutBody = Type.Object({
  setsCompleted: Type.Number({ minimum: 0 }),
  repsCompleted: Type.Number({ minimum: 0 }),
  weight: Type.Number({ minimum: 0 }),
  notes: Type.Optional(Type.String()),
});

export const FinishSessionBody = Type.Object({
  groupId: Type.String({ minLength: 1 }),
  sets: Type.Array(
    Type.Object({
      workoutExerciseId: Type.String({ minLength: 1 }),
      repsCompleted: Type.Number({ minimum: 0 }),
      weight: Type.Number({ minimum: 0 }),
    }),
  ),
});
