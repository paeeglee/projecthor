import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/modules/shared/ui/button";
import {
  finishWorkoutSession,
  getGroupExercises,
} from "@/modules/workout/services/workout.service";
import {
  clearWorkoutLocalStorage,
  findActiveWorkoutGroupId,
  getActiveWorkoutDuration,
  getActiveWorkoutSets,
} from "@/modules/workout/utils/active-workout";
import { ExercisePreviewCard } from "./exercise-preview-card";

export function WorkoutPreviewPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictGroupId, setConflictGroupId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exercises", groupId],
    queryFn: () => getGroupExercises(groupId!),
    enabled: !!groupId,
  });

  const resolveConflictMutation = useMutation({
    mutationFn: async (oldGroupId: string) => {
      const savedSets = getActiveWorkoutSets(oldGroupId);
      const duration = getActiveWorkoutDuration(oldGroupId);

      const completedSets: Array<{
        workoutExerciseId: string;
        repsCompleted: number;
        weight: number;
      }> = [];

      if (savedSets) {
        for (const [exerciseId, sets] of Object.entries(savedSets)) {
          for (const set of sets) {
            if (!set.completed) continue;
            completedSets.push({
              workoutExerciseId: exerciseId,
              repsCompleted: set.reps,
              weight: set.weight,
            });
          }
        }
      }

      if (completedSets.length > 0) {
        await finishWorkoutSession(oldGroupId, completedSets, duration);
      }

      clearWorkoutLocalStorage(oldGroupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-goals"] });
      queryClient.invalidateQueries({ queryKey: ["workout-summary"] });
      queryClient.invalidateQueries({ queryKey: ["relative-strength"] });
      queryClient.invalidateQueries({ queryKey: ["muscle-group-chart"] });
      setShowConflictDialog(false);
      navigate(`/workout/${groupId}`);
    },
  });

  const handleStartWorkout = () => {
    const activeGroupId = findActiveWorkoutGroupId();

    if (!activeGroupId || activeGroupId === groupId) {
      navigate(`/workout/${groupId}`);
      return;
    }

    setConflictGroupId(activeGroupId);
    setShowConflictDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-text-muted">Carregando...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-text-muted">Falha ao carregar treino</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="sticky top-0 z-10 bg-background py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex size-9 items-center justify-center rounded-full hover:bg-surface-light"
          >
            <ArrowLeft className="size-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">{data.group.label}</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {data.exercises.map((exercise) => (
          <ExercisePreviewCard
            key={exercise.id}
            exerciseName={exercise.exerciseName}
            images={exercise.images}
            sets={exercise.sets}
            reps={exercise.reps}
            lastSession={exercise.lastSession}
          />
        ))}
      </div>

      <div className="sticky bottom-0 flex gap-3 bg-background py-4">
        <Button
          className="flex-1"
          variant="ghost"
          onClick={() => navigate("/home")}
        >
          Voltar
        </Button>
        <Button className="flex-1" onClick={handleStartWorkout}>
          Iniciar Treino
        </Button>
      </div>

      {showConflictDialog && conflictGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-6">
            <h2 className="text-lg font-bold text-white">
              Treino em andamento
            </h2>
            <p className="text-sm text-text-muted">
              Você já tem um treino em andamento. Deseja finalizar o treino
              anterior e iniciar este?
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="ghost"
                onClick={() => setShowConflictDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={resolveConflictMutation.isPending}
                onClick={() => resolveConflictMutation.mutate(conflictGroupId)}
              >
                {resolveConflictMutation.isPending
                  ? "Finalizando..."
                  : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
