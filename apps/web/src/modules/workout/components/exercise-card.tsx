import { useCallback } from "react";

export interface SetRow {
  reps: number;
  weight: number;
  completed: boolean;
}

interface ExerciseCardProps {
  exerciseId: string;
  exerciseName: string;
  sets: SetRow[];
  onSetChange: (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number,
  ) => void;
  onSetComplete?: (exerciseId: string, setIndex: number) => void;
}

export function ExerciseCard({
  exerciseId,
  exerciseName,
  sets,
  onSetChange,
  onSetComplete,
}: ExerciseCardProps) {
  const completedCount = sets.filter((s) => s.completed).length;
  const totalSets = sets.length;
  const progressPercent =
    totalSets > 0 ? (completedCount / totalSets) * 100 : 0;

  const handleChange = useCallback(
    (setIndex: number, field: "reps" | "weight", raw: string) => {
      const value = Number(raw) || 0;
      onSetChange(exerciseId, setIndex, field, value);
    },
    [exerciseId, onSetChange],
  );

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="size-14 shrink-0 rounded-lg bg-surface-light" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{exerciseName}</h3>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-light">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="mt-1 text-xs text-text-muted">
            {completedCount}/{totalSets} séries
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-[1.5rem_1fr_1fr_2.5rem] gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <span>#</span>
          <span>Reps</span>
          <span>Carga</span>
          <span />
        </div>
        {sets.map((set, i) => (
          <div
            key={i}
            className="grid grid-cols-[1.5rem_1fr_1fr_2.5rem] items-center gap-2"
          >
            <span className="text-sm text-text-muted">{i + 1}</span>
            <input
              type="number"
              inputMode="numeric"
              value={set.reps || ""}
              onChange={(e) => handleChange(i, "reps", e.target.value)}
              disabled={set.completed}
              className="h-9 min-w-0 rounded-md bg-surface-light px-2 text-sm text-white outline-none disabled:opacity-50"
            />
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={set.completed ? set.weight : set.weight || ""}
                onChange={(e) => handleChange(i, "weight", e.target.value)}
                disabled={set.completed}
                className="h-9 w-full min-w-0 rounded-md bg-surface-light px-2 pr-7 text-sm text-white outline-none disabled:opacity-50"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                kg
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSetComplete?.(exerciseId, i)}
              disabled={!onSetComplete}
              className="flex size-9 items-center justify-center justify-self-center rounded-full transition-colors disabled:opacity-50"
            >
              <div
                className={`size-5 rounded-full border-2 transition-colors ${
                  set.completed
                    ? "border-primary bg-primary"
                    : "border-text-muted"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
