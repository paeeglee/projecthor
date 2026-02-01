import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/modules/shared/ui/button";
import {
  getGroupExercises,
  logExerciseSet,
  type GroupExercisesResponse,
} from "@/modules/workout/services/workout.service";
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
  }>({ visible: false, seconds: 0 });

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
        setSetsMap(initial);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [groupId]);

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
            setRestTimer({ visible: true, seconds: exercise.restSeconds });
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

  const handleFinish = async () => {
    setSubmitting(true);
    const promises: Promise<void>[] = [];

    for (const [exerciseId, sets] of Object.entries(setsMap)) {
      for (const set of sets) {
        if (!set.completed) continue;
        promises.push(
          logExerciseSet(exerciseId, {
            setsCompleted: 1,
            repsCompleted: set.reps,
            weight: set.weight,
          }),
        );
      }
    }

    try {
      await Promise.all(promises);
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

  return (
    <div className="flex min-h-svh flex-col">
      <div className="sticky top-0 z-10 bg-background py-4">
        <h1 className="text-lg font-bold text-white">{data.group.label}</h1>
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

      {restTimer.visible && (
        <RestTimer
          key={restTimer.seconds + Date.now()}
          seconds={restTimer.seconds}
          onDismiss={() => setRestTimer({ visible: false, seconds: 0 })}
        />
      )}
    </div>
  );
}
