import type { AuthUser } from "./auth.types";

export interface IAuthMiddlewareRepository {
  getUser(token: string): Promise<AuthUser | null>;
}
