CREATE TABLE workout_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  UUID NOT NULL,
  name        TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workout_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workout_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_group_id UUID NOT NULL REFERENCES workout_groups(id) ON DELETE CASCADE,
  exercise_id      UUID NOT NULL REFERENCES exercises(id),
  sets             INT NOT NULL,
  reps             INT NOT NULL,
  display_order    INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workout_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id  UUID NOT NULL REFERENCES workout_exercises(id),
  athlete_id           UUID NOT NULL,
  sets_completed       INT NOT NULL,
  reps_completed       INT NOT NULL,
  weight               NUMERIC(7,2) NOT NULL,
  notes                TEXT,
  completed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
