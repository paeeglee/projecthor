import { useQuery } from "@tanstack/react-query";
import {
  getMuscleGroupChart,
  type MuscleGroupChartResponse,
} from "@/modules/home/services/dashboard.service";

const CHART_SIZE = 300;
const CENTER = CHART_SIZE / 2;
const LABEL_OFFSET = 18;
const MAX_RADIUS = CENTER - 50;
const RINGS = 3;

function polarToCartesian(
  angle: number,
  radius: number,
): { x: number; y: number } {
  const rad = angle - Math.PI / 2;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function MuscleGroupChartSkeleton() {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-surface-light" />
      <div className="flex items-center justify-center">
        <div
          className="animate-pulse rounded-full bg-surface-light"
          style={{ width: CHART_SIZE, height: CHART_SIZE }}
        />
      </div>
    </div>
  );
}

export function MuscleGroupChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["muscle-group-chart"],
    queryFn: getMuscleGroupChart,
  });

  if (isLoading) return <MuscleGroupChartSkeleton />;
  if (!data || data.muscleGroups.length === 0) return null;

  const { muscleGroups } = data;
  const count = muscleGroups.length;
  const maxValue = Math.max(...muscleGroups.map((g) => g.averageWeight), 1);
  const angleStep = (2 * Math.PI) / count;

  const dataPoints = muscleGroups.map((group, i) => {
    const angle = i * angleStep;
    const ratio = group.averageWeight / maxValue;
    const radius = ratio * MAX_RADIUS;
    return polarToCartesian(angle, radius);
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-xl bg-surface p-4">
      <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
        Muscle Groups — Last 7 days
      </span>
      <div className="mt-2 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          width="100%"
          style={{ maxWidth: CHART_SIZE }}
          role="img"
          aria-label="Muscle group average weight polar chart"
        >
          {Array.from({ length: RINGS }).map((_, i) => {
            const ringRadius = ((i + 1) / RINGS) * MAX_RADIUS;
            return (
              <circle
                key={`ring-${ringRadius}`}
                cx={CENTER}
                cy={CENTER}
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-text-muted"
              />
            );
          })}

          {muscleGroups.map((group, i) => {
            const angle = i * angleStep;
            const edgePoint = polarToCartesian(angle, MAX_RADIUS);
            const labelPoint = polarToCartesian(
              angle,
              MAX_RADIUS + LABEL_OFFSET,
            );

            return (
              <g key={group.name}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={edgePoint.x}
                  y2={edgePoint.y}
                  stroke="currentColor"
                  strokeWidth={0.5}
                  className="text-text-muted"
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-text-muted text-[8px] capitalize"
                >
                  {group.name}
                </text>
              </g>
            );
          })}

          <polygon
            points={polygonPoints}
            className="fill-primary/20 stroke-primary"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {dataPoints.map((point, i) => (
            <circle
              key={muscleGroups[i].name}
              cx={point.x}
              cy={point.y}
              r={2.5}
              className="fill-primary"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
