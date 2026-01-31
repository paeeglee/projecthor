import { Elysia } from "elysia";
import type { IAuthMiddlewareRepository } from "../../domain/auth/auth-middleware.repository";

export const authMiddlewarePlugin = (repository: IAuthMiddlewareRepository) =>
  new Elysia({ name: "auth-middleware" })
    .derive(async ({ headers, set }) => {
      const authorization = headers.authorization;

      if (!authorization || !authorization.startsWith("Bearer ")) {
        set.status = 401;
        throw new Error("Missing authorization token");
      }

      const token = authorization.slice(7);
      const user = await repository.getUser(token);

      if (!user) {
        set.status = 401;
        throw new Error("Invalid or expired token");
      }

      return { user };
    })
    .as("scoped");
