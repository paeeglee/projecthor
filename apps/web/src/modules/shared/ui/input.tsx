import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-text-muted border-border bg-surface text-text h-12 w-full min-w-0 rounded-md border px-3 py-2 text-base outline-none transition-colors",
        "focus-visible:border-primary focus-visible:ring-primary-light focus-visible:ring-2",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
