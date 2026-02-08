import { HelpDrawer } from "@/modules/shared/ui/help-drawer";

interface Props {
  history: { weekStart: string; igfr: number }[];
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 160;
const PADDING = { top: 20, right: 16, bottom: 30, left: 40 };

const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export function WeeklyStrengthChart({ history }: Props) {
  if (history.length < 2) return null;

  const values = history.map((h) => h.igfr);
  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1;
  const range = maxVal - minVal || 1;

  const points = history.map((entry, i) => ({
    x: PADDING.left + (i / (history.length - 1)) * INNER_WIDTH,
    y: PADDING.top + (1 - (entry.igfr - minVal) / range) * INNER_HEIGHT,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const formatWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("pt-BR", { month: "short" });
    return `${day} ${month}`;
  };

  const labelCount = Math.min(4, history.length);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i * (history.length - 1)) / (labelCount - 1)),
  );

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
          Evolução Semanal
        </span>
        <HelpDrawer title="Evolução Semanal">
          <p>
            Este gráfico mostra sua{" "}
            <strong className="text-text">
              evolução do IGFR semana a semana
            </strong>
            . Cada ponto representa sua força relativa média daquela semana,
            combinando todos os padrões de movimento.
          </p>
          <p className="mt-3">
            <strong className="text-text">Linha subindo:</strong> você está
            ficando mais forte em relação ao seu peso corporal. Isso pode
            significar que está aumentando carga, fazendo mais reps, ou perdendo
            gordura mantendo a força.
          </p>
          <p className="mt-3">
            <strong className="text-text">Linha descendo:</strong> pode indicar
            fadiga acumulada, necessidade de deload, ou mudança na rotina de
            treino. Quedas ocasionais são normais — o que importa é a tendência
            geral.
          </p>
          <p className="mt-3">
            <strong className="text-text">Exemplo:</strong> se a linha vai de
            7.2 a 7.8 em 4 semanas, significa que em média você está movendo ~8%
            mais carga relativa por exercício. Progresso consistente.
          </p>
        </HelpDrawer>
      </div>
      <div className="mt-2 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          width="100%"
          style={{ maxWidth: CHART_WIDTH }}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PADDING.top + (1 - ratio) * INNER_HEIGHT;
            const val = minVal + ratio * range;
            return (
              <g key={ratio}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={PADDING.left + INNER_WIDTH}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={0.5}
                  className="text-text-muted"
                  opacity={0.3}
                />
                <text
                  x={PADDING.left - 6}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-text-muted text-[8px]"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {labelIndices.map((idx) => (
            <text
              key={idx}
              x={points[idx].x}
              y={CHART_HEIGHT - 6}
              textAnchor="middle"
              className="fill-text-muted text-[8px]"
            >
              {formatWeek(history[idx].weekStart)}
            </text>
          ))}

          <path
            d={linePath}
            fill="none"
            className="stroke-primary"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <circle
              key={history[i].weekStart}
              cx={p.x}
              cy={p.y}
              r={2.5}
              className="fill-primary"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
