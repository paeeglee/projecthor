import type { SupabaseClient } from "@supabase/supabase-js";
import type { IAuthMiddlewareRepository } from "../../domain/auth/auth-middleware.repository";
import type { AuthUser } from "../../domain/auth/auth.types";

export class AuthMiddlewareRepository implements IAuthMiddlewareRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getUser(token: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user || !data.user.email) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  }
}
