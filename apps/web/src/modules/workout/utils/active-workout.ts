import type { SetRow } from "../components/exercise-card";

export function findActiveWorkoutGroupId(): string | null {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("workout-timer-")) {
      return key.replace("workout-timer-", "");
    }
  }
  return null;
}

export function clearWorkoutLocalStorage(groupId: string): void {
  localStorage.removeItem(`workout-timer-${groupId}`);
  localStorage.removeItem(`workout-sets-${groupId}`);
}

export function getActiveWorkoutSets(
  groupId: string,
): Record<string, SetRow[]> | null {
  const raw = localStorage.getItem(`workout-sets-${groupId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, SetRow[]>;
  } catch {
    return null;
  }
}

export function getActiveWorkoutDuration(groupId: string): number {
  const startTimestamp = Number(
    localStorage.getItem(`workout-timer-${groupId}`),
  );
  if (!startTimestamp) return 0;
  return Math.floor((Date.now() - startTimestamp) / 1000);
}
