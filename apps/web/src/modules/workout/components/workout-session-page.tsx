import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useBlocker } from "react-router";
import { Button } from "@/modules/shared/ui/button";
import {
  getGroupExercises,
  finishWorkoutSession,
  type GroupExercisesResponse,
} from "@/modules/workout/services/workout.service";
import { CircularProgress } from "@/modules/shared/ui/circular-progress";
import { ExerciseCard, type SetRow } from "./exercise-card";
import { RestTimer } from "./rest-timer";

export function WorkoutSessionPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<GroupExercisesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [setsMap, setSetsMap] = useState<Record<string, SetRow[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [restTimer, setRestTimer] = useState<{
    visible: boolean;
    seconds: number;
    key: number;
  }>({ visible: false, seconds: 0, key: 0 });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!groupId) return;
    getGroupExercises(groupId)
      .then((res) => {
        setData(res);
        const initial: Record<string, SetRow[]> = {};
        for (const ex of res.exercises) {
          initial[ex.id] = Array.from({ length: ex.sets }, () => ({
            reps: ex.reps,
            weight: 0,
            completed: false,
          }));
        }

        const savedRaw = localStorage.getItem(`workout-sets-${groupId}`);
        if (savedRaw) {
          try {
            const saved: Record<string, SetRow[]> = JSON.parse(savedRaw);
            const savedKeys = Object.keys(saved).sort().join(",");
            const initialKeys = Object.keys(initial).sort().join(",");
            if (savedKeys === initialKeys) {
              setSetsMap(saved);
              return;
            }
          } catch {
            // corrupted data, fall through to default
          }
        }

        setSetsMap(initial);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const key = `workout-timer-${groupId}`;
    let startTimestamp = Number(localStorage.getItem(key));
    if (!startTimestamp) {
      startTimestamp = Date.now();
      localStorage.setItem(key, String(startTimestamp));
    }

    setElapsed(Math.floor((Date.now() - startTimestamp) / 1000));

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimestamp) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [groupId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    if (!groupId || Object.keys(setsMap).length === 0) return;
    localStorage.setItem(`workout-sets-${groupId}`, JSON.stringify(setsMap));
  }, [groupId, setsMap]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !submitting && currentLocation.pathname !== nextLocation.pathname,
  );

  const handleSetChange = useCallback(
    (
      exerciseId: string,
      setIndex: number,
      field: "reps" | "weight",
      value: number,
    ) => {
      setSetsMap((prev) => {
        const updated = [...(prev[exerciseId] ?? [])];
        updated[setIndex] = { ...updated[setIndex], [field]: value };
        return { ...prev, [exerciseId]: updated };
      });
    },
    [],
  );

  const handleSetComplete = useCallback(
    (exerciseId: string, setIndex: number) => {
      setSetsMap((prev) => {
        const wasCompleted = prev[exerciseId]?.[setIndex]?.completed;
        const updated = [...(prev[exerciseId] ?? [])];
        updated[setIndex] = {
          ...updated[setIndex],
          completed: !updated[setIndex].completed,
          weight: updated[setIndex].weight || 0,
        };

        if (!wasCompleted && data) {
          const exercise = data.exercises.find((ex) => ex.id === exerciseId);
          if (exercise?.restSeconds) {
            setRestTimer({
              visible: true,
              seconds: exercise.restSeconds,
              key: Date.now(),
            });
          }
        }

        return { ...prev, [exerciseId]: updated };
      });
    },
    [data],
  );

  const hasCompletedSets = Object.values(setsMap).some((sets) =>
    sets.some((s) => s.completed),
  );

  const formatTime = (totalSeconds: number) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleFinish = async () => {
    if (!groupId) return;
    setSubmitting(true);

    const completedSets: Array<{
      workoutExerciseId: string;
      repsCompleted: number;
      weight: number;
    }> = [];

    for (const [exerciseId, sets] of Object.entries(setsMap)) {
      for (const set of sets) {
        if (!set.completed) continue;
        completedSets.push({
          workoutExerciseId: exerciseId,
          repsCompleted: set.reps,
          weight: set.weight,
        });
      }
    }

    const key = `workout-timer-${groupId}`;
    const startTimestamp = Number(localStorage.getItem(key)) || Date.now();
    const durationSeconds = Math.floor((Date.now() - startTimestamp) / 1000);

    try {
      await finishWorkoutSession(groupId, completedSets, durationSeconds);
      localStorage.removeItem(key);
      localStorage.removeItem(`workout-sets-${groupId}`);
      navigate("/home");
    } catch {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-text-muted">Failed to load workout</p>
      </div>
    );
  }

  const totalSets = Object.values(setsMap).reduce(
    (sum, sets) => sum + sets.length,
    0,
  );
  const completedSetsCount = Object.values(setsMap).reduce(
    (sum, sets) => sum + sets.filter((s) => s.completed).length,
    0,
  );
  const workoutProgress =
    totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

  return (
    <div className="flex min-h-svh flex-col">
      <div className="sticky top-0 z-10 bg-background py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">{data.group.label}</h1>
            <CircularProgress value={workoutProgress} />
          </div>
          <span className="flex items-center font-mono text-sm text-text-muted">
            <span className="size-2 rounded-full bg-red-500 mr-2" />
            {formatTime(elapsed)
              .split(":")
              .map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="text-primary">:</span>
                  )}
                </span>
              ))}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {data.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exerciseId={exercise.id}
            exerciseName={exercise.exerciseName}
            sets={setsMap[exercise.id] ?? []}
            onSetChange={handleSetChange}
            onSetComplete={restTimer.visible ? undefined : handleSetComplete}
          />
        ))}
      </div>

      <div className="sticky bottom-0 bg-background py-4">
        <Button
          className="w-full"
          size="lg"
          disabled={!hasCompletedSets || submitting}
          onClick={handleFinish}
        >
          {submitting ? "Finishing..." : "Finish Workout"}
        </Button>
      </div>

      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-6">
            <h2 className="text-lg font-bold text-white">Leave workout?</h2>
            <p className="text-sm text-text-muted">
              Your timer will keep running. You can return to continue.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="ghost"
                onClick={() => blocker.reset?.()}
              >
                Stay
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => blocker.proceed?.()}
              >
                Leave
              </Button>
            </div>
          </div>
        </div>
      )}

      {restTimer.visible && (
        <RestTimer
          key={restTimer.key}
          seconds={restTimer.seconds}
          onDismiss={() => setRestTimer({ visible: false, seconds: 0, key: 0 })}
        />
      )}
    </div>
  );
}
