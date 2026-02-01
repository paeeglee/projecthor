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
    const month = d.toLocaleString("en", { month: "short" });
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
          Weekly Evolution
        </span>
        <HelpDrawer title="Weekly Evolution">
          <p>
            This chart shows your{" "}
            <strong className="text-text">IGFR evolution week by week</strong>.
            Each point represents your average relative strength for that week,
            combining all movement patterns.
          </p>
          <p className="mt-3">
            <strong className="text-text">Line going up:</strong> you're getting
            stronger relative to your body weight. This could mean you're
            increasing load, doing more reps, or losing fat while maintaining
            strength.
          </p>
          <p className="mt-3">
            <strong className="text-text">Line going down:</strong> may indicate
            accumulated fatigue, a needed deload, or a change in training
            routine. Occasional dips are normal — what matters is the overall
            trend.
          </p>
          <p className="mt-3">
            <strong className="text-text">Example:</strong> if the line goes
            from 7.2 to 7.8 over 4 weeks, it means on average you're moving ~8%
            more relative load per exercise. Consistent progress.
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
