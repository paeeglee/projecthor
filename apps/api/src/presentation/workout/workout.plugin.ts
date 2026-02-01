import { Elysia } from "elysia";
import type { AddExerciseToGroupUseCase } from "../../application/workout/add-exercise-to-group.use-case";
import type { AddWorkoutGroupUseCase } from "../../application/workout/add-workout-group.use-case";
import type { CreateWorkoutPlanUseCase } from "../../application/workout/create-workout-plan.use-case";
import type { DeactivateWorkoutPlanUseCase } from "../../application/workout/deactivate-workout-plan.use-case";
import type { FinishWorkoutSessionUseCase } from "../../application/workout/finish-workout-session.use-case";
import type { GetGroupExercisesUseCase } from "../../application/workout/get-group-exercises.use-case";
import type { GetWorkoutHistoryUseCase } from "../../application/workout/get-workout-history.use-case";
import type { GetWorkoutPlanUseCase } from "../../application/workout/get-workout-plan.use-case";
import type { LogWorkoutUseCase } from "../../application/workout/log-workout.use-case";
import type { RemoveExerciseFromGroupUseCase } from "../../application/workout/remove-exercise-from-group.use-case";
import type { RemoveWorkoutGroupUseCase } from "../../application/workout/remove-workout-group.use-case";
import type { UpdateGroupExerciseUseCase } from "../../application/workout/update-group-exercise.use-case";
import type { UpdateWorkoutGroupUseCase } from "../../application/workout/update-workout-group.use-case";
import type { UpdateWorkoutPlanUseCase } from "../../application/workout/update-workout-plan.use-case";
import type { authMiddlewarePlugin } from "../auth/auth-middleware.plugin";
import {
  AddExerciseBody,
  CreateGroupBody,
  CreatePlanBody,
  ExerciseIdParams,
  FinishSessionBody,
  GroupIdNestedParams,
  GroupIdParams,
  LogWorkoutBody,
  PlanIdNestedParams,
  PlanIdParams,
  UpdateExerciseBody,
  UpdateGroupBody,
  UpdatePlanBody,
  WorkoutExerciseIdParams,
} from "./workout.schemas";

interface WorkoutUseCases {
  authMiddleware: ReturnType<typeof authMiddlewarePlugin>;
  createPlan: CreateWorkoutPlanUseCase;
  getPlan: GetWorkoutPlanUseCase;
  updatePlan: UpdateWorkoutPlanUseCase;
  deactivatePlan: DeactivateWorkoutPlanUseCase;
  addGroup: AddWorkoutGroupUseCase;
  updateGroup: UpdateWorkoutGroupUseCase;
  removeGroup: RemoveWorkoutGroupUseCase;
  addExercise: AddExerciseToGroupUseCase;
  updateExercise: UpdateGroupExerciseUseCase;
  removeExercise: RemoveExerciseFromGroupUseCase;
  logWorkout: LogWorkoutUseCase;
  finishSession: FinishWorkoutSessionUseCase;
  getHistory: GetWorkoutHistoryUseCase;
  getGroupExercises: GetGroupExercisesUseCase;
}

export const workoutPlugin = (useCases: WorkoutUseCases) =>
  new Elysia({ prefix: "/workout" })
    .use(useCases.authMiddleware)
    .post(
      "/plans",
      async ({ body, user, set }) => {
        const plan = await useCases.createPlan.execute(user.id, body.name);
        set.status = 201;
        return plan;
      },
      { body: CreatePlanBody },
    )
    .get("/plans/active", async ({ user, set }) => {
      const result = await useCases.getPlan.execute(user.id);
      if (!result) {
        set.status = 404;
        return { error: "No active workout plan found" };
      }
      return result;
    })
    .get(
      "/groups/:groupId/exercises",
      async ({ params, user, set }) => {
        const result = await useCases.getGroupExercises.execute(
          params.groupId,
          user.id,
        );
        if (!result) {
          set.status = 404;
          return { error: "Group not found" };
        }
        return result;
      },
      { params: GroupIdNestedParams },
    )
    .patch(
      "/plans/:id",
      async ({ params, body, set }) => {
        try {
          return await useCases.updatePlan.execute(params.id, body.name);
        } catch (error: unknown) {
          if (
            error !== null &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "PGRST116"
          ) {
            set.status = 404;
            return { error: "Plan not found" };
          }
          throw error;
        }
      },
      { params: PlanIdParams, body: UpdatePlanBody },
    )
    .patch(
      "/plans/:id/deactivate",
      async ({ params }) => {
        await useCases.deactivatePlan.execute(params.id);
        return { success: true };
      },
      { params: PlanIdParams },
    )
    .post(
      "/plans/:planId/groups",
      async ({ params, body, set }) => {
        const group = await useCases.addGroup.execute(
          params.planId,
          body.label,
          body.displayOrder,
        );
        set.status = 201;
        return group;
      },
      { params: PlanIdNestedParams, body: CreateGroupBody },
    )
    .patch(
      "/groups/:id",
      async ({ params, body, set }) => {
        try {
          return await useCases.updateGroup.execute(params.id, body);
        } catch (error: unknown) {
          if (
            error !== null &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "PGRST116"
          ) {
            set.status = 404;
            return { error: "Group not found" };
          }
          throw error;
        }
      },
      { params: GroupIdParams, body: UpdateGroupBody },
    )
    .delete(
      "/groups/:id",
      async ({ params, set }) => {
        await useCases.removeGroup.execute(params.id);
        set.status = 204;
      },
      { params: GroupIdParams },
    )
    .post(
      "/groups/:groupId/exercises",
      async ({ params, body, set }) => {
        const exercise = await useCases.addExercise.execute({
          workoutGroupId: params.groupId,
          exerciseId: body.exerciseId,
          sets: body.sets,
          reps: body.reps,
          displayOrder: body.displayOrder,
        });
        set.status = 201;
        return exercise;
      },
      { params: GroupIdNestedParams, body: AddExerciseBody },
    )
    .patch(
      "/exercises/:id",
      async ({ params, body, set }) => {
        try {
          return await useCases.updateExercise.execute(params.id, body);
        } catch (error: unknown) {
          if (
            error !== null &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "PGRST116"
          ) {
            set.status = 404;
            return { error: "Exercise not found" };
          }
          throw error;
        }
      },
      { params: ExerciseIdParams, body: UpdateExerciseBody },
    )
    .delete(
      "/exercises/:id",
      async ({ params, set }) => {
        await useCases.removeExercise.execute(params.id);
        set.status = 204;
      },
      { params: ExerciseIdParams },
    )
    .post(
      "/exercises/:workoutExerciseId/logs",
      async ({ params, body, user, set }) => {
        const log = await useCases.logWorkout.execute({
          workoutExerciseId: params.workoutExerciseId,
          athleteId: user.id,
          setsCompleted: body.setsCompleted,
          repsCompleted: body.repsCompleted,
          weight: body.weight,
          notes: body.notes,
        });
        set.status = 201;
        return log;
      },
      { params: WorkoutExerciseIdParams, body: LogWorkoutBody },
    )
    .get(
      "/exercises/:workoutExerciseId/logs",
      async ({ params }) => {
        return useCases.getHistory.execute(params.workoutExerciseId);
      },
      { params: WorkoutExerciseIdParams },
    )
    .post(
      "/sessions",
      async ({ body, user, set }) => {
        const session = await useCases.finishSession.execute({
          workoutGroupId: body.groupId,
          athleteId: user.id,
          sets: body.sets,
          durationSeconds: body.durationSeconds,
        });
        set.status = 201;
        return session;
      },
      { body: FinishSessionBody },
    );
