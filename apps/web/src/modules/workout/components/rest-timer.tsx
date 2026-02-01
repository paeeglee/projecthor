import { useCallback, useEffect, useState } from "react";
import { BatteryCharging } from "lucide-react";
import { Button } from "@/modules/shared/ui/button";

interface RestTimerProps {
  seconds: number;
  onDismiss: () => void;
}

export function RestTimer({ seconds, onDismiss }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      onDismiss();
    }
  }, [remaining, onDismiss]);

  const adjust = useCallback((delta: number) => {
    setRemaining((prev) => {
      const next = prev + delta;
      return next < 0 ? 0 : next;
    });
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-4 rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-lg">
      <BatteryCharging className="size-10 animate-pulse text-gray-400" />
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => adjust(-15)}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 active:bg-gray-200"
        >
          −15
        </button>
        <span className="text-5xl font-bold tabular-nums text-gray-900">
          {remaining}
        </span>
        <button
          type="button"
          onClick={() => adjust(15)}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 active:bg-gray-200"
        >
          +15
        </button>
      </div>
      <Button size="sm" onClick={onDismiss}>
        Skip
      </Button>
    </div>
  );
}
