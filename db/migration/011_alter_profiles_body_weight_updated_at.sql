ALTER TABLE profiles
  ALTER COLUMN body_weight_updated_at DROP NOT NULL,
  ALTER COLUMN body_weight_updated_at DROP DEFAULT;
