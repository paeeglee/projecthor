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
