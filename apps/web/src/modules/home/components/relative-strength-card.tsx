import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  getRelativeStrength,
  type RelativeStrengthResponse,
} from "@/modules/home/services/dashboard.service";
import { HelpDrawer } from "@/modules/shared/ui/help-drawer";
import { PatternBreakdown } from "./pattern-breakdown";
import { WeeklyStrengthChart } from "./weekly-strength-chart";
import { BodyWeightUpdate } from "./body-weight-update";

function RelativeStrengthSkeleton() {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-4 h-4 w-48 animate-pulse rounded bg-surface-light" />
      <div className="h-20 animate-pulse rounded bg-surface-light" />
    </div>
  );
}

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: "text-green-400", sign: "+" },
  down: { icon: TrendingDown, color: "text-red-400", sign: "" },
  stable: { icon: Minus, color: "text-text-muted", sign: "" },
} as const;

export function RelativeStrengthCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["relative-strength"],
    queryFn: getRelativeStrength,
  });

  if (isLoading) return <RelativeStrengthSkeleton />;
  if (!data) return null;

  const { icon: TrendIcon, color, sign } = TREND_CONFIG[data.trend];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Relative Strength
          </span>
          <HelpDrawer title="Relative Strength Score">
            <p>
              The <strong className="text-text">Relative Strength score</strong>{" "}
              measures your strength normalized by body weight. It combines all
              your exercises into a single number you can track over time.
            </p>
            <p className="mt-3">
              <strong className="text-text">How it works:</strong> for each
              exercise, we calculate{" "}
              <span className="text-text">(weight × reps) ÷ body weight</span>.
              Then we group by movement pattern (Squat, Hinge, Push, Pull, Core)
              and average them.
            </p>
            <p className="mt-3">
              <strong className="text-text">The number (e.g. 104):</strong>{" "}
              represents your current strength compared to your best phase (best
              4 consecutive weeks). 100 = your baseline. Above 100 = new peak.
              Below 90 = possible fatigue.
            </p>
            <p className="mt-3">
              <strong className="text-text">Example:</strong> if you bench press
              80kg × 8 reps and weigh 80kg, your Push FR is (80 × 8) ÷ 80 = 8.0.
              Next week at 85kg × 8, it rises to 8.5 — the score reflects that
              progression.
            </p>
          </HelpDrawer>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-5xl font-bold text-text">{data.score}</span>
          <div className={`mb-1 flex items-center gap-1 ${color}`}>
            <TrendIcon className="size-4" />
            <span className="text-sm font-medium">
              {sign}
              {data.trendDelta}%
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {sign}
          {data.trendDelta}% vs best 4 weeks
        </p>
        {data.bodyWeightStale && <BodyWeightUpdate />}
      </div>
      <PatternBreakdown breakdown={data.breakdown} />
      <WeeklyStrengthChart history={data.weeklyHistory} />
    </div>
  );
}
