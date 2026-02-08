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
          Por Padrão de Movimento
        </span>
        <HelpDrawer title="Padrões de Movimento">
          <p>
            Seus exercícios são automaticamente classificados em{" "}
            <strong className="text-text">5 padrões de movimento</strong> com
            base nos músculos trabalhados:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong className="text-text">Squat</strong> — agachamento, leg
              press, hack squat
            </li>
            <li>
              <strong className="text-text">Hinge</strong> — levantamento terra,
              hip thrust, RDL
            </li>
            <li>
              <strong className="text-text">Push</strong> — supino,
              desenvolvimento, tríceps
            </li>
            <li>
              <strong className="text-text">Pull</strong> — barra fixa, remadas,
              bíceps
            </li>
            <li>
              <strong className="text-text">Core</strong> — abdominais, prancha,
              carries
            </li>
          </ul>
          <p className="mt-3">
            <strong className="text-text">As barras</strong> mostram sua Força
            Relativa média para cada padrão nos últimos 14 dias. O maior valor
            preenche a barra inteira e o restante é proporcional.
          </p>
          <p className="mt-3">
            <strong className="text-text">Como usar:</strong> se um padrão está
            muito abaixo dos outros, pode indicar um desequilíbrio muscular. Por
            exemplo, se Pull está em 6.0 e Push em 10.0, considere dar mais
            atenção aos exercícios de puxar.
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
