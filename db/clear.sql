-- Disable FK checks
SET session_replication_role = 'replica';

DELETE FROM workout_sessions;
DELETE FROM workout_logs;
DELETE FROM workout_exercises;
DELETE FROM workout_groups;
DELETE FROM workout_plans;
DELETE FROM anamnesis_responses;

-- Re-enable FK checks
SET session_replication_role = 'origin';
