# Exercises Module Design

## Overview

Static exercises module backed by a Supabase table, seeded from a JSON dataset (873 exercises). Exposes a single endpoint to fetch an exercise by slug.

## Database Table

```sql
CREATE TABLE exercises (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  force              TEXT,
  level              TEXT NOT NULL,
  mechanic           TEXT,
  equipment          TEXT,
  primary_muscles    JSONB NOT NULL,
  secondary_muscles  JSONB NOT NULL,
  instructions       JSONB NOT NULL,
  category           TEXT NOT NULL,
  images             JSONB NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- `id`: UUID primary key with auto-generation
- `slug`: Unique, derived from the JSON `id` field normalized to lowercase-hyphens (e.g. `3_4_Sit-Up` → `3-4-sit-up`)
- Arrays (`primary_muscles`, `secondary_muscles`, `instructions`, `images`) stored as `jsonb`
- No `updated_at` — static seed data

## Migration

SQL file at `db/migration/001_create_exercises_table.sql`.

## Seed Script

Bun script at `db/migration/seeds/seed-exercises.ts`:

1. Reads `exercises.json` from the same directory
2. Normalizes `id` → `slug`: lowercase, replace underscores with hyphens
3. Maps JSON fields to snake_case columns
4. Inserts in batches of 100 using `supabaseAdmin` (bypasses RLS)
5. Uses `upsert` on `slug` for idempotency

Run: `bun run db/migration/seeds/seed-exercises.ts`

## API Endpoint

`GET /exercises/:slug` — returns a single exercise or 404.

## Architecture (Clean Architecture)

```
domain/exercise/
  exercise.entity.ts        — Exercise type
  exercise.repository.ts    — IExerciseRepository { findBySlug(slug): Exercise | null }

application/exercise/
  get-exercise-by-slug.use-case.ts

infrastructure/exercise/
  exercise.repository.ts    — Supabase implementation

presentation/exercise/
  exercise.schemas.ts       — TypeBox param + response schemas
  exercise.plugin.ts        — GET /exercises/:slug route
```

Wired in `container.ts` and registered in `index.ts`, following auth/health patterns.

## Slug Normalization

`id` from JSON → lowercase → replace `_` with `-`

Example: `3_4_Sit-Up` → `3-4-sit-up`
