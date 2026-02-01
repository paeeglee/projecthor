export type MovementPattern = "squat" | "hinge" | "push" | "pull" | "core";

const EXCLUDED_CATEGORIES = new Set(["stretching", "cardio"]);

const PUSH_MUSCLES = new Set(["chest", "shoulders", "triceps"]);
const PULL_MUSCLES = new Set(["lats", "middle back", "biceps"]);
const SQUAT_MUSCLES = new Set([
  "quadriceps",
  "glutes",
  "abductors",
  "adductors",
]);
const HINGE_MUSCLES = new Set(["hamstrings", "lower back", "glutes"]);

interface ExerciseMetadata {
  force: string | null;
  primaryMuscles: string[];
  category: string;
}

export function classifyMovementPattern(
  exercise: ExerciseMetadata,
): MovementPattern | null {
  if (EXCLUDED_CATEGORIES.has(exercise.category)) return null;

  const muscles = exercise.primaryMuscles;
  const hasAny = (set: Set<string>) => muscles.some((m) => set.has(m));

  if (muscles.includes("abdominals")) return "core";
  if (exercise.force === "push" && hasAny(PUSH_MUSCLES)) return "push";
  if (exercise.force === "pull" && hasAny(PULL_MUSCLES)) return "pull";
  if (hasAny(SQUAT_MUSCLES) && muscles.includes("quadriceps")) return "squat";
  if (hasAny(HINGE_MUSCLES)) return "hinge";
  if (hasAny(SQUAT_MUSCLES)) return "squat";
  if (exercise.force === "push") return "push";
  if (exercise.force === "pull") return "pull";

  return null;
}
