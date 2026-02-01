CREATE TABLE profiles (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL UNIQUE,
  body_weight            DECIMAL NOT NULL,
  body_weight_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
