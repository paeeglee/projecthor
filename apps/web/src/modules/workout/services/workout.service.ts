import { api } from "@/modules/shared/services/api";

interface GroupExercise {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number | null;
  notes: string | null;
  displayOrder: number;
}

export interface GroupExercisesResponse {
  group: { id: string; label: string };
  exercises: GroupExercise[];
}

export async function getGroupExercises(
  groupId: string,
): Promise<GroupExercisesResponse> {
  const { data } = await api.get<GroupExercisesResponse>(
    `/workout/groups/${groupId}/exercises`,
  );
  return data;
}

export async function finishWorkoutSession(
  groupId: string,
  sets: Array<{
    workoutExerciseId: string;
    repsCompleted: number;
    weight: number;
  }>,
): Promise<void> {
  await api.post("/workout/sessions", { groupId, sets });
}
