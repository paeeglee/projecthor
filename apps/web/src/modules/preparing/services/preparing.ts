import { api } from "@/modules/shared/services/api";

export async function generateWorkout(): Promise<void> {
  await api.post("/ai/generate-workout");
}
