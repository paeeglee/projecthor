import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: { key: string; title: string }[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-center gap-0">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg transition-colors",
                index < currentStep && "bg-primary text-text-on-primary",
                index === currentStep &&
                  "border-2 border-primary bg-primary/20 text-primary",
                index > currentStep && "bg-surface-light text-text-muted",
              )}
            >
              {index < currentStep ? (
                <Check className="size-5" strokeWidth={3} />
              ) : (
                <div
                  className={cn(
                    "size-3 rounded-sm",
                    index === currentStep ? "bg-primary" : "bg-text-muted/50",
                  )}
                />
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6 transition-colors",
                  index < currentStep ? "bg-primary" : "bg-surface-light",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm font-medium text-text">
        {steps[currentStep]?.title}
      </p>
    </div>
  );
}
