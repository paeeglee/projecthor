import type { SupabaseClient } from "@supabase/supabase-js";
import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { SignUpResult } from "../../domain/auth/auth.types";

export class AuthRepository implements IAuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user || !data.session) {
      throw new Error("Sign up failed: no user or session returned");
    }

    if (!data.user.email) {
      throw new Error("Sign up failed: no email returned for user");
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async signIn(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user.email) {
      throw new Error("Sign in failed: no email returned for user");
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async refreshSession(refreshToken: string): Promise<AuthTokens> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error("Refresh failed: no session returned");
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw error;
    }
  }

  // NOTE: Two-step operation. If verifyOtp succeeds but updateUser fails,
  // the OTP is consumed and the user must request a new reset email.
  async confirmResetPassword(token: string, password: string): Promise<void> {
    const { error: verifyError } = await this.supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (verifyError) {
      throw verifyError;
    }

    const { error: updateError } = await this.supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      throw updateError;
    }
  }
}
