import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router";
import { Button } from "@/modules/shared/ui/button";
import { CircularProgress } from "@/modules/shared/ui/circular-progress";
import {
  finishWorkoutSession,
  getGroupExercises,
} from "@/modules/workout/services/workout.service";
import { ExerciseCard, type SetRow } from "./exercise-card";
import { RestTimer } from "./rest-timer";

export function WorkoutSessionPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [setsMap, setSetsMap] = useState<Record<string, SetRow[]>>({});
  const [restTimer, setRestTimer] = useState<{
    visible: boolean;
    seconds: number;
    key: number;
  }>({ visible: false, seconds: 0, key: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [showTimerConfirm, setShowTimerConfirm] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);

  const {
    data,
    isLoading: loading,
    isError: error,
  } = useQuery({
    queryKey: ["exercises", groupId],
    queryFn: () => getGroupExercises(groupId!),
    enabled: !!groupId,
  });

  useEffect(() => {
    if (!data || !groupId) return;
    if (Object.keys(setsMap).length > 0) return;

    const initial: Record<string, SetRow[]> = {};
    for (const ex of data.exercises) {
      initial[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        reps: ex.lastSession?.[i]?.reps ?? ex.reps,
        weight: ex.lastSession?.[i]?.weight ?? 0,
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
  }, [data, groupId]);

  useEffect(() => {
    if (!groupId || timerPaused) return;

    const key = `workout-timer-${groupId}`;
    let startTimestamp = Number(localStorage.getItem(key));

    if (!startTimestamp) {
      startTimestamp = Date.now();
      localStorage.setItem(key, String(startTimestamp));
    } else {
      const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
      if (elapsedSeconds > 45 * 60 && !showTimerConfirm && elapsed === 0) {
        setElapsed(elapsedSeconds);
        setShowTimerConfirm(true);
        setTimerPaused(true);
        return;
      }
    }

    setElapsed(Math.floor((Date.now() - startTimestamp) / 1000));

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimestamp) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [groupId, timerPaused]);

  const handleTimerContinue = () => {
    setShowTimerConfirm(false);
    setTimerPaused(false);
  };

  const handleTimerReset = () => {
    if (!groupId) return;
    const key = `workout-timer-${groupId}`;
    localStorage.setItem(key, String(Date.now()));
    setElapsed(0);
    setShowTimerConfirm(false);
    setTimerPaused(false);
  };

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
      !finishMutation.isPending &&
      currentLocation.pathname !== nextLocation.pathname,
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

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) return;
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

      await finishWorkoutSession(groupId, completedSets, durationSeconds);
      localStorage.removeItem(key);
      localStorage.removeItem(`workout-sets-${groupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-goals"] });
      queryClient.invalidateQueries({ queryKey: ["workout-summary"] });
      queryClient.invalidateQueries({ queryKey: ["relative-strength"] });
      queryClient.invalidateQueries({ queryKey: ["muscle-group-chart"] });
      navigate("/home");
    },
  });

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-text-muted">Carregando...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-text-muted">Falha ao carregar treino</p>
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
            images={exercise.images}
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
          disabled={!hasCompletedSets || finishMutation.isPending}
          onClick={() => finishMutation.mutate()}
        >
          {finishMutation.isPending ? "Finalizando..." : "Finalizar Treino"}
        </Button>
      </div>

      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-6">
            <h2 className="text-lg font-bold text-white">Sair do treino?</h2>
            <p className="text-sm text-text-muted">
              Seu timer continuará rodando. Você pode voltar para continuar.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="ghost"
                onClick={() => blocker.reset?.()}
              >
                Ficar
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => blocker.proceed?.()}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTimerConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-6">
            <h2 className="text-lg font-bold text-white">
              Treino em andamento
            </h2>
            <p className="text-sm text-text-muted">
              Seu timer está em{" "}
              <span className="font-mono text-white">
                {formatTime(elapsed)}
              </span>
              . Já se passaram mais de 45 minutos. Deseja reiniciar o timer ou
              continuar de onde parou?
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="ghost"
                onClick={handleTimerReset}
              >
                Reiniciar
              </Button>
              <Button className="flex-1" onClick={handleTimerContinue}>
                Continuar
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
