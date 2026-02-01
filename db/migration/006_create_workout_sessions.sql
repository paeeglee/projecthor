CREATE TABLE workout_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_group_id  UUID NOT NULL REFERENCES workout_groups(id) ON DELETE CASCADE,
  athlete_id        UUID NOT NULL,
  finished_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_logs
  ADD COLUMN workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL;
