# Auth Module Design

## Overview

Authentication module using Supabase Auth. All JWT generation, validation, and session management is handled by the Supabase Auth SDK. Tokens are not generated manually.

## Routes

All routes under the `/auth` prefix. All are public (no auth middleware required).

| Route                        | Method | Body                    | Response (200)                              |
| ---------------------------- | ------ | ----------------------- | ------------------------------------------- |
| `/auth/signup`               | POST   | `{ email, password }`   | `{ user, accessToken, refreshToken }`       |
| `/auth/signin`               | POST   | `{ email, password }`   | `{ accessToken, refreshToken }`             |
| `/auth/revalidate`           | POST   | `{ refreshToken }`      | `{ accessToken, refreshToken }`             |
| `/auth/reset-password`       | POST   | `{ email }`             | `{ message }`                               |
| `/auth/reset-password/confirm` | POST | `{ token, password }`   | `{ message }`                               |

## Token Configuration

Configured in the **Supabase Dashboard**, not in code:

- **Access token expiry:** 1800 seconds (30 minutes)
- **Refresh token expiry:** 7 days
- **Refresh token rotation:** enabled
- **Email confirmation:** disabled (login immediately after signup)

## Architecture

Follows the Clean Architecture pattern established in the project.

### Domain (`domain/auth/`)

- `auth.types.ts` — shared types: `AuthTokens`, `AuthUser`, `SignUpResult`
- `auth.repository.ts` — `IAuthRepository` interface with methods:
  - `signUp(email, password)`
  - `signIn(email, password)`
  - `refreshSession(refreshToken)`
  - `resetPassword(email)`
  - `confirmResetPassword(token, password)`

### Application (`application/auth/`)

One use case per route, each with an `execute()` method:

- `SignUpUseCase`
- `SignInUseCase`
- `RevalidateUseCase`
- `ResetPasswordUseCase`
- `ConfirmResetPasswordUseCase`

### Infrastructure (`infrastructure/auth/`)

- `auth.repository.ts` — implements `IAuthRepository` using Supabase Auth SDK:
  - `supabase.auth.signUp`
  - `supabase.auth.signInWithPassword`
  - `supabase.auth.refreshSession`
  - `supabase.auth.resetPasswordForEmail`
  - `supabase.auth.verifyOtp` + `supabase.auth.updateUser`

### Presentation (`presentation/auth/`)

- `auth.plugin.ts` — Elysia plugin with `/auth` prefix, receives the 5 use cases via parameters
- `auth.schemas.ts` — TypeBox schemas for request body validation

### Container

`container.ts` updated to instantiate the auth repository and all 5 use cases.

## Error Handling

| Scenario                        | Status | Response                                                  |
| ------------------------------- | ------ | --------------------------------------------------------- |
| Invalid credentials (signin)    | 401    | `{ error: "Invalid credentials" }`                        |
| Email already registered (signup) | 409  | `{ error: "Email already registered" }`                   |
| Invalid/expired refresh token   | 401    | `{ error: "Invalid refresh token" }`                      |
| Email not found (reset)         | 200    | `{ message: "If the email exists, a reset link was sent" }` |
| Invalid reset token (confirm)   | 401    | `{ error: "Invalid or expired token" }`                   |
| Body validation failed          | 422    | Automatic via Elysia/TypeBox                              |

**Security note:** The `/auth/reset-password` route always returns 200 with a generic message regardless of whether the email exists, to prevent user enumeration.

## Scope

This module covers only the auth routes. An auth middleware for protecting other routes is out of scope and will be a separate module.
