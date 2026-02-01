import { Elysia, t } from "elysia";
import type { CreateProfileUseCase } from "../../application/profile/create-profile.use-case";
import type { GetProfileUseCase } from "../../application/profile/get-profile.use-case";
import type { UpdateBodyWeightUseCase } from "../../application/profile/update-body-weight.use-case";
import type { authMiddlewarePlugin } from "../auth/auth-middleware.plugin";

interface ProfileUseCases {
  authMiddleware: ReturnType<typeof authMiddlewarePlugin>;
  createProfile: CreateProfileUseCase;
  getProfile: GetProfileUseCase;
  updateBodyWeight: UpdateBodyWeightUseCase;
}

export const profilePlugin = (useCases: ProfileUseCases) =>
  new Elysia({ prefix: "/profiles" })
    .use(useCases.authMiddleware)
    .get("/me", async ({ user }) => {
      return useCases.getProfile.execute(user.id);
    })
    .post(
      "/",
      async ({ user, body }) => {
        return useCases.createProfile.execute(
          user.id,
          body.fullName,
          body.bodyWeight,
        );
      },
      {
        body: t.Object({
          fullName: t.String(),
          bodyWeight: t.Optional(t.Number()),
        }),
      },
    )
    .patch(
      "/me/body-weight",
      async ({ user, body }) => {
        return useCases.updateBodyWeight.execute(user.id, body.bodyWeight);
      },
      { body: t.Object({ bodyWeight: t.Number() }) },
    );
