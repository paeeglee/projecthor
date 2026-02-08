import { useQuery } from "@tanstack/react-query";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  getRelativeStrength,
  type RelativeStrengthResponse,
} from "@/modules/home/services/dashboard.service";
import { HelpDrawer } from "@/modules/shared/ui/help-drawer";
import { BodyWeightUpdate } from "./body-weight-update";
import { PatternBreakdown } from "./pattern-breakdown";
import { WeeklyStrengthChart } from "./weekly-strength-chart";

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
            Força Relativa
          </span>
          <HelpDrawer title="Índice de Força Relativa">
            <p>
              O <strong className="text-text">índice de Força Relativa</strong>{" "}
              mede sua força normalizada pelo peso corporal. Ele combina todos
              os seus exercícios em um único número que você pode acompanhar ao
              longo do tempo.
            </p>
            <p className="mt-3">
              <strong className="text-text">Como funciona:</strong> para cada
              exercício, calculamos{" "}
              <span className="text-text">(carga × reps) ÷ peso corporal</span>.
              Depois agrupamos por padrão de movimento (Squat, Hinge, Push,
              Pull, Core) e tiramos a média.
            </p>
            <p className="mt-3">
              <strong className="text-text">O número (ex: 104):</strong>{" "}
              representa sua força atual comparada à sua melhor fase (melhores 4
              semanas consecutivas). 100 = sua linha de base. Acima de 100 =
              novo pico. Abaixo de 90 = possível fadiga.
            </p>
            <p className="mt-3">
              <strong className="text-text">Exemplo:</strong> se você faz supino
              com 80kg × 8 reps e pesa 80kg, seu Push FR é (80 × 8) ÷ 80 = 8.0.
              Na semana seguinte com 85kg × 8, sobe para 8.5 — o índice reflete
              essa progressão.
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
          {data.trendDelta}% vs melhores 4 semanas
        </p>
        {data.bodyWeightStale && <BodyWeightUpdate />}
      </div>
      <PatternBreakdown breakdown={data.breakdown} />
      <WeeklyStrengthChart history={data.weeklyHistory} />
    </div>
  );
}
