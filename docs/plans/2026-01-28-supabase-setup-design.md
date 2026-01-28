# Supabase Setup Design

## Overview

Configure the Supabase JS SDK in the API project to provide Database, Auth, and Storage capabilities. The client lives in the infrastructure layer, following the existing Clean Architecture patterns.

## Environment Configuration

A config module at `infrastructure/config/env.ts`:

- Defines a TypeBox schema for required environment variables: `SUPABASE_URL` (string/uri), `SUPABASE_ANON_KEY` (string), `SUPABASE_SERVICE_ROLE_KEY` (string), and `PORT` (optional, defaults to `3000`).
- Reads from `process.env`, validates against the schema at import time, and exports a typed `env` object.
- Throws a clear error at startup if any required variable is missing or invalid.

A `.env.example` file at `apps/api/.env.example` documents the expected variables.

The entry point (`index.ts`) imports the config module early so validation runs before the server starts.

## Supabase Client

A module at `infrastructure/supabase/client.ts`:

- Imports the validated `env` object from the config module.
- Creates and exports two Supabase client instances:
  - **`supabase`** — initialized with `SUPABASE_ANON_KEY`. Respects Row Level Security (RLS), used when acting on behalf of a user.
  - **`supabaseAdmin`** — initialized with `SUPABASE_SERVICE_ROLE_KEY`. Bypasses RLS, used for server-side administrative operations.
- Both are singletons via ES module caching.
- No Supabase types or details leak outside `infrastructure/`.

Dependency: `@supabase/supabase-js` added to `apps/api/package.json`.

## Auth, Storage, and Repository Integration

No premature abstractions. The Supabase client exposes `supabase.auth` and `supabase.storage` — concrete services will be created in `infrastructure/auth/` and `infrastructure/storage/` when the first features need them, implementing domain-defined interfaces.

Repositories in `infrastructure/` import the Supabase client directly. The composition root (`container.ts`) evolves naturally as new use cases are added.

## Files to Create/Modify

- **Create** `apps/api/src/infrastructure/config/env.ts` — env validation with TypeBox
- **Create** `apps/api/src/infrastructure/supabase/client.ts` — Supabase client instances
- **Create** `apps/api/.env.example` — documented env template
- **Modify** `apps/api/src/index.ts` — import config module early
- **Modify** `apps/api/package.json` — add `@supabase/supabase-js` dependency
