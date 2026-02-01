import type { MovementPattern } from "@/modules/home/services/dashboard.service";
import { HelpDrawer } from "@/modules/shared/ui/help-drawer";

interface Props {
  breakdown: { pattern: MovementPattern; fr: number }[];
}

const PATTERN_LABELS: Record<MovementPattern, string> = {
  squat: "Squat",
  hinge: "Hinge",
  push: "Push",
  pull: "Pull",
  core: "Core",
};

export function PatternBreakdown({ breakdown }: Props) {
  if (breakdown.length === 0) return null;

  const sorted = [...breakdown].sort((a, b) => b.fr - a.fr);
  const maxFR = sorted[0].fr;

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
          By Movement Pattern
        </span>
        <HelpDrawer title="Movement Patterns">
          <p>
            Your exercises are automatically classified into{" "}
            <strong className="text-text">5 movement patterns</strong> based on
            the muscles worked:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong className="text-text">Squat</strong> — squats, leg press,
              hack squat
            </li>
            <li>
              <strong className="text-text">Hinge</strong> — deadlift, hip
              thrust, RDL
            </li>
            <li>
              <strong className="text-text">Push</strong> — bench press,
              shoulder press, triceps
            </li>
            <li>
              <strong className="text-text">Pull</strong> — pull-ups, rows,
              biceps
            </li>
            <li>
              <strong className="text-text">Core</strong> — crunches, planks,
              carries
            </li>
          </ul>
          <p className="mt-3">
            <strong className="text-text">The bars</strong> show your average
            Relative Strength for each pattern over the last 14 days. The
            highest value fills the full bar and the rest are proportional.
          </p>
          <p className="mt-3">
            <strong className="text-text">How to use it:</strong> if one pattern
            is much lower than the others, it may indicate a muscular imbalance.
            For example, if Pull is at 6.0 and Push at 10.0, consider giving
            more attention to pulling exercises.
          </p>
        </HelpDrawer>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {sorted.map(({ pattern, fr }) => (
          <div key={pattern} className="flex items-center gap-3">
            <span className="w-12 text-xs font-medium text-text-muted">
              {PATTERN_LABELS[pattern]}
            </span>
            <div className="flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-light">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(fr / maxFR) * 100}%` }}
                />
              </div>
            </div>
            <span className="w-10 text-right text-xs font-semibold text-text">
              {fr.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
