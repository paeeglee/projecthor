# Auth Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement authentication routes (signup, signin, revalidate, reset-password) using Supabase Auth SDK.

**Architecture:** Clean Architecture with 4 layers — domain types/interfaces, application use cases, infrastructure Supabase implementation, presentation Elysia plugin. Follows exact patterns from the health module.

**Tech Stack:** TypeScript, Elysia, Supabase Auth SDK, TypeBox for validation

**Design doc:** `docs/plans/2026-01-28-auth-module-design.md`

---

### Task 1: Domain Layer — Types and Repository Interface

**Files:**
- Create: `apps/api/src/domain/auth/auth.types.ts`
- Create: `apps/api/src/domain/auth/auth.repository.ts`

**Step 1: Create auth types**

Create `apps/api/src/domain/auth/auth.types.ts`:

```typescript
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignUpResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
```

**Step 2: Create auth repository interface**

Create `apps/api/src/domain/auth/auth.repository.ts`:

```typescript
import type { AuthTokens, AuthUser, SignUpResult } from "./auth.types";

export interface IAuthRepository {
  signUp(email: string, password: string): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<AuthTokens>;
  refreshSession(refreshToken: string): Promise<AuthTokens>;
  resetPassword(email: string): Promise<void>;
  confirmResetPassword(token: string, password: string): Promise<void>;
}
```

**Step 3: Commit**

```bash
git add apps/api/src/domain/auth/
git commit -m "feat(api): add auth domain types and repository interface"
```

---

### Task 2: Application Layer — Use Cases

**Files:**
- Create: `apps/api/src/application/auth/sign-up.use-case.ts`
- Create: `apps/api/src/application/auth/sign-in.use-case.ts`
- Create: `apps/api/src/application/auth/revalidate.use-case.ts`
- Create: `apps/api/src/application/auth/reset-password.use-case.ts`
- Create: `apps/api/src/application/auth/confirm-reset-password.use-case.ts`

**Step 1: Create SignUpUseCase**

Create `apps/api/src/application/auth/sign-up.use-case.ts`:

```typescript
import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { SignUpResult } from "../../domain/auth/auth.types";

export class SignUpUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<SignUpResult> {
    return this.authRepository.signUp(email, password);
  }
}
```

**Step 2: Create SignInUseCase**

Create `apps/api/src/application/auth/sign-in.use-case.ts`:

```typescript
import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { AuthTokens } from "../../domain/auth/auth.types";

export class SignInUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<AuthTokens> {
    return this.authRepository.signIn(email, password);
  }
}
```

**Step 3: Create RevalidateUseCase**

Create `apps/api/src/application/auth/revalidate.use-case.ts`:

```typescript
import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { AuthTokens } from "../../domain/auth/auth.types";

export class RevalidateUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    return this.authRepository.refreshSession(refreshToken);
  }
}
```

**Step 4: Create ResetPasswordUseCase**

Create `apps/api/src/application/auth/reset-password.use-case.ts`:

```typescript
import type { IAuthRepository } from "../../domain/auth/auth.repository";

export class ResetPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    return this.authRepository.resetPassword(email);
  }
}
```

**Step 5: Create ConfirmResetPasswordUseCase**

Create `apps/api/src/application/auth/confirm-reset-password.use-case.ts`:

```typescript
import type { IAuthRepository } from "../../domain/auth/auth.repository";

export class ConfirmResetPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(token: string, password: string): Promise<void> {
    return this.authRepository.confirmResetPassword(token, password);
  }
}
```

**Step 6: Commit**

```bash
git add apps/api/src/application/auth/
git commit -m "feat(api): add auth use cases"
```

---

### Task 3: Infrastructure Layer — Supabase Auth Repository

**Files:**
- Create: `apps/api/src/infrastructure/auth/auth.repository.ts`

**Step 1: Implement AuthRepository**

Create `apps/api/src/infrastructure/auth/auth.repository.ts`:

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IAuthRepository } from "../../domain/auth/auth.repository";
import type { AuthTokens, SignUpResult } from "../../domain/auth/auth.types";

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

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async signIn(email: string, password: string): Promise<AuthTokens> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return {
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
```

**Step 2: Commit**

```bash
git add apps/api/src/infrastructure/auth/
git commit -m "feat(api): add Supabase auth repository implementation"
```

---

### Task 4: Presentation Layer — Schemas and Plugin

**Files:**
- Create: `apps/api/src/presentation/auth/auth.schemas.ts`
- Create: `apps/api/src/presentation/auth/auth.plugin.ts`

**Step 1: Create TypeBox schemas**

Create `apps/api/src/presentation/auth/auth.schemas.ts`:

```typescript
import { Type } from "@sinclair/typebox";

export const SignUpBody = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
});

export const SignInBody = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 1 }),
});

export const RevalidateBody = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
});

export const ResetPasswordBody = Type.Object({
  email: Type.String({ format: "email" }),
});

export const ConfirmResetPasswordBody = Type.Object({
  token: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 8 }),
});
```

**Step 2: Create auth plugin**

Create `apps/api/src/presentation/auth/auth.plugin.ts`:

```typescript
import { Elysia } from "elysia";
import type { SignUpUseCase } from "../../application/auth/sign-up.use-case";
import type { SignInUseCase } from "../../application/auth/sign-in.use-case";
import type { RevalidateUseCase } from "../../application/auth/revalidate.use-case";
import type { ResetPasswordUseCase } from "../../application/auth/reset-password.use-case";
import type { ConfirmResetPasswordUseCase } from "../../application/auth/confirm-reset-password.use-case";
import {
  SignUpBody,
  SignInBody,
  RevalidateBody,
  ResetPasswordBody,
  ConfirmResetPasswordBody,
} from "./auth.schemas";

interface AuthUseCases {
  signUp: SignUpUseCase;
  signIn: SignInUseCase;
  revalidate: RevalidateUseCase;
  resetPassword: ResetPasswordUseCase;
  confirmResetPassword: ConfirmResetPasswordUseCase;
}

export const authPlugin = (useCases: AuthUseCases) =>
  new Elysia({ prefix: "/auth" })
    .post(
      "/signup",
      async ({ body, set }) => {
        try {
          const result = await useCases.signUp.execute(body.email, body.password);
          set.status = 201;
          return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          };
        } catch (error: any) {
          if (error.message?.includes("already registered")) {
            set.status = 409;
            return { error: "Email already registered" };
          }
          throw error;
        }
      },
      { body: SignUpBody },
    )
    .post(
      "/signin",
      async ({ body, set }) => {
        try {
          const tokens = await useCases.signIn.execute(body.email, body.password);
          return tokens;
        } catch (error: any) {
          set.status = 401;
          return { error: "Invalid credentials" };
        }
      },
      { body: SignInBody },
    )
    .post(
      "/revalidate",
      async ({ body, set }) => {
        try {
          const tokens = await useCases.revalidate.execute(body.refreshToken);
          return tokens;
        } catch (error: any) {
          set.status = 401;
          return { error: "Invalid refresh token" };
        }
      },
      { body: RevalidateBody },
    )
    .post(
      "/reset-password",
      async ({ body }) => {
        try {
          await useCases.resetPassword.execute(body.email);
        } catch {
          // Silently ignore errors to prevent user enumeration
        }
        return { message: "If the email exists, a reset link was sent" };
      },
      { body: ResetPasswordBody },
    )
    .post(
      "/reset-password/confirm",
      async ({ body, set }) => {
        try {
          await useCases.confirmResetPassword.execute(body.token, body.password);
          return { message: "Password reset successfully" };
        } catch (error: any) {
          set.status = 401;
          return { error: "Invalid or expired token" };
        }
      },
      { body: ConfirmResetPasswordBody },
    );
```

**Step 3: Commit**

```bash
git add apps/api/src/presentation/auth/
git commit -m "feat(api): add auth schemas and Elysia plugin"
```

---

### Task 5: Wire Everything — Container and Entry Point

**Files:**
- Modify: `apps/api/src/container.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Update container.ts**

Replace the entire contents of `apps/api/src/container.ts` with:

```typescript
import { GetHealthStatusUseCase } from "./application/health/get-health-status.use-case";
import { SignUpUseCase } from "./application/auth/sign-up.use-case";
import { SignInUseCase } from "./application/auth/sign-in.use-case";
import { RevalidateUseCase } from "./application/auth/revalidate.use-case";
import { ResetPasswordUseCase } from "./application/auth/reset-password.use-case";
import { ConfirmResetPasswordUseCase } from "./application/auth/confirm-reset-password.use-case";
import { HealthRepository } from "./infrastructure/health/health.repository";
import { AuthRepository } from "./infrastructure/auth/auth.repository";
import { supabase } from "./infrastructure/supabase/client";

const healthRepository = new HealthRepository();
const getHealthStatusUseCase = new GetHealthStatusUseCase(healthRepository);

const authRepository = new AuthRepository(supabase);
const signUpUseCase = new SignUpUseCase(authRepository);
const signInUseCase = new SignInUseCase(authRepository);
const revalidateUseCase = new RevalidateUseCase(authRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
const confirmResetPasswordUseCase = new ConfirmResetPasswordUseCase(authRepository);

export const container = {
  getHealthStatusUseCase,
  signUpUseCase,
  signInUseCase,
  revalidateUseCase,
  resetPasswordUseCase,
  confirmResetPasswordUseCase,
};
```

**Step 2: Update index.ts**

Replace the entire contents of `apps/api/src/index.ts` with:

```typescript
import { env } from "./infrastructure/config/env";
import { Elysia } from "elysia";
import { container } from "./container";
import { healthPlugin } from "./presentation/health/health.plugin";
import { authPlugin } from "./presentation/auth/auth.plugin";

const port = Number(env.PORT);

new Elysia()
  .use(healthPlugin(container.getHealthStatusUseCase))
  .use(
    authPlugin({
      signUp: container.signUpUseCase,
      signIn: container.signInUseCase,
      revalidate: container.revalidateUseCase,
      resetPassword: container.resetPasswordUseCase,
      confirmResetPassword: container.confirmResetPasswordUseCase,
    }),
  )
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
```

**Step 3: Verify the server starts**

Run: `cd apps/api && bun run dev`
Expected: `Server running on port 3000` (no TypeScript or import errors)

**Step 4: Commit**

```bash
git add apps/api/src/container.ts apps/api/src/index.ts
git commit -m "feat(api): wire auth module into container and entry point"
```

---

### Task 6: Smoke Test with curl

**Step 1: Start the dev server**

Run: `cd apps/api && bun run dev`

**Step 2: Test signup**

```bash
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}' | jq
```

Expected: 201 with `{ user, accessToken, refreshToken }`

**Step 3: Test signin**

```bash
curl -s -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}' | jq
```

Expected: 200 with `{ accessToken, refreshToken }`

**Step 4: Test revalidate** (use the refreshToken from step 3)

```bash
curl -s -X POST http://localhost:3000/auth/revalidate \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token_from_step_3>"}' | jq
```

Expected: 200 with new `{ accessToken, refreshToken }`

**Step 5: Test validation error**

```bash
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"short"}' | jq
```

Expected: 422 validation error

**Step 6: Test invalid credentials**

```bash
curl -s -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrongpassword"}' | jq
```

Expected: 401 with `{ error: "Invalid credentials" }`
