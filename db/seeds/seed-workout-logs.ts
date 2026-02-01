import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ATHLETE_ID = "08a245b4-5b57-4893-a101-4f73fcbcb033";

// Base weights (kg) by exercise category
const BASE_WEIGHTS: Record<string, number> = {
  // Chest
  "machine-bench-press": 40,
  "incline-dumbbell-press": 12,
  "cable-crossover": 10,
  "triceps-pushdown": 15,
  "bench-dips": 0,
  pushups: 0,
  // Back
  "wide-grip-lat-pulldown": 35,
  "seated-cable-rows": 30,
  "leverage-high-row": 30,
  "one-arm-dumbbell-row": 14,
  "dumbbell-bicep-curl": 8,
  "hammer-curls": 8,
  // Legs
  "leg-press": 80,
  "bodyweight-squat": 0,
  "lying-leg-curls": 25,
  "leg-extensions": 25,
  "standing-calf-raises": 40,
  "butt-lift-bridge": 0,
  // Shoulders & Core
  "seated-dumbbell-press": 10,
  "side-lateral-raise": 6,
  "front-dumbbell-raise": 6,
  "reverse-flyes": 6,
  plank: 0,
  "cable-crunch": 20,
  // Full body
  "trap-bar-deadlift": 60,
  "goblet-squat": 16,
  "incline-push-up": 0,
  "inverted-row": 0,
  "dumbbell-lunges": 10,
  "exercise-ball-crunch": 0,
};

// Progressive weight multiplier by week range
function getWeekMultiplier(weekIndex: number): number {
  if (weekIndex < 2) return 1.0;
  if (weekIndex < 6) return 1.12;
  if (weekIndex < 10) return 1.22;
  return 1.32;
}

// Random variation ±5%
function vary(value: number): number {
  const factor = 0.95 + Math.random() * 0.1;
  return Math.round(value * factor * 4) / 4; // round to nearest 0.25
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() + (max - min + 1)) + min;
}

// Pick n random indices from array of size length
function pickRandomIndices(length: number, n: number): Set<number> {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, n));
}

function getWeight(exerciseSlug: string, weekIndex: number): number {
  const base = BASE_WEIGHTS[exerciseSlug] ?? 10;
  if (base === 0) return 0;
  return vary(base * getWeekMultiplier(weekIndex));
}

interface WorkoutGroup {
  id: string;
  label: string;
  exercises: { id: string; exercise_id: string; sets: number; reps: number; slug: string }[];
}

async function fetchWorkoutData(): Promise<WorkoutGroup[]> {
  // Get active plan
  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("athlete_id", ATHLETE_ID)
    .eq("active", true)
    .single();

  if (planError || !plan) {
    console.error("Could not find active workout plan:", planError?.message);
    process.exit(1);
  }

  // Get groups
  const { data: groups, error: groupsError } = await supabase
    .from("workout_groups")
    .select("id, label, display_order")
    .eq("workout_plan_id", plan.id)
    .order("display_order");

  if (groupsError || !groups?.length) {
    console.error("Could not find workout groups:", groupsError?.message);
    process.exit(1);
  }

  // Get exercises for each group
  const result: WorkoutGroup[] = [];
  for (const group of groups) {
    const { data: exercises, error: exError } = await supabase
      .from("workout_exercises")
      .select("id, exercise_id, sets, reps, display_order")
      .eq("workout_group_id", group.id)
      .order("display_order");

    if (exError) {
      console.error(`Error fetching exercises for group ${group.label}:`, exError.message);
      process.exit(1);
    }

    // Get slugs for weight lookup
    const exerciseIds = (exercises ?? []).map((e) => e.exercise_id);
    const { data: catalogExercises } = await supabase
      .from("exercises")
      .select("id, slug")
      .in("id", exerciseIds);

    const slugMap = new Map((catalogExercises ?? []).map((e) => [e.id, e.slug]));

    result.push({
      id: group.id,
      label: group.label,
      exercises: (exercises ?? []).map((e) => ({
        id: e.id,
        exercise_id: e.exercise_id,
        sets: e.sets,
        reps: e.reps,
        slug: slugMap.get(e.exercise_id) ?? "unknown",
      })),
    });
  }

  return result;
}

function generateDates(): { date: Date; weekIndex: number }[] {
  const startDate = new Date("2025-11-01T00:00:00Z");
  const endDate = new Date("2026-02-01T00:00:00Z");
  const trainingDays: { date: Date; weekIndex: number }[] = [];

  let currentWeekStart = new Date(startDate);
  let weekIndex = 0;

  while (currentWeekStart < endDate) {
    // Build 7 days for this week
    const weekDays: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(currentWeekStart);
      day.setUTCDate(day.getUTCDate() + d);
      if (day >= endDate) break;
      weekDays.push(day);
    }

    if (weekDays.length === 0) break;

    // Pick 2 random rest days (or fewer if week is short)
    const restCount = Math.min(2, weekDays.length > 2 ? 2 : 0);
    const restDays = pickRandomIndices(weekDays.length, restCount);

    for (let i = 0; i < weekDays.length; i++) {
      if (!restDays.has(i)) {
        trainingDays.push({ date: weekDays[i], weekIndex });
      }
    }

    currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() + 7);
    weekIndex++;
  }

  return trainingDays;
}

async function seed() {
  console.log("Fetching workout plan data...");
  const groups = await fetchWorkoutData();
  console.log(`Found ${groups.length} groups with exercises.`);

  const trainingDays = generateDates();
  console.log(`Generated ${trainingDays.length} training days over ~3 months.`);

  // ~10% skip rate
  const skipRate = 0.1;
  let groupRotation = 0;

  const sessionRows: Record<string, unknown>[] = [];
  const logRows: Record<string, unknown>[] = [];

  for (const { date, weekIndex } of trainingDays) {
    // Skip ~10% of sessions
    if (Math.random() < skipRate) {
      groupRotation = (groupRotation + 1) % groups.length;
      continue;
    }

    const group = groups[groupRotation % groups.length];
    groupRotation++;

    // Random training time between 6am and 8pm
    const hour = 6 + Math.floor(Math.random() * 14);
    const minute = Math.floor(Math.random() * 60);
    const sessionDate = new Date(date);
    sessionDate.setUTCHours(hour, minute, 0, 0);

    // Duration 40-70 minutes
    const durationSeconds = (40 + Math.floor(Math.random() * 31)) * 60;

    const sessionId = crypto.randomUUID();

    sessionRows.push({
      id: sessionId,
      workout_group_id: group.id,
      athlete_id: ATHLETE_ID,
      duration_seconds: durationSeconds,
      finished_at: new Date(sessionDate.getTime() + durationSeconds * 1000).toISOString(),
      created_at: sessionDate.toISOString(),
    });

    for (const exercise of group.exercises) {
      const weight = getWeight(exercise.slug, weekIndex);

      for (let s = 0; s < exercise.sets; s++) {
        logRows.push({
          workout_exercise_id: exercise.id,
          athlete_id: ATHLETE_ID,
          sets_completed: 1,
          reps_completed: exercise.reps,
          weight,
          workout_session_id: sessionId,
          completed_at: new Date(sessionDate.getTime() + s * 1000).toISOString(),
          created_at: new Date(sessionDate.getTime() + s * 1000).toISOString(),
        });
      }
    }
  }

  console.log(`Inserting ${sessionRows.length} sessions...`);
  const BATCH_SIZE = 100;

  for (let i = 0; i < sessionRows.length; i += BATCH_SIZE) {
    const batch = sessionRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("workout_sessions").insert(batch);
    if (error) {
      console.error(`Error inserting sessions batch ${i / BATCH_SIZE + 1}:`, error.message);
      process.exit(1);
    }
    console.log(`Sessions batch ${i / BATCH_SIZE + 1} (${batch.length} rows)`);
  }

  console.log(`Inserting ${logRows.length} workout logs...`);

  for (let i = 0; i < logRows.length; i += BATCH_SIZE) {
    const batch = logRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("workout_logs").insert(batch);
    if (error) {
      console.error(`Error inserting logs batch ${i / BATCH_SIZE + 1}:`, error.message);
      process.exit(1);
    }
    console.log(`Logs batch ${i / BATCH_SIZE + 1} (${batch.length} rows)`);
  }

  console.log(
    `Done. Created ${sessionRows.length} sessions and ${logRows.length} workout logs.`,
  );
}

seed();
