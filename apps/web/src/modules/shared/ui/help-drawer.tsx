import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";

interface HelpDrawerProps {
  title: string;
  children: React.ReactNode;
}

export function HelpDrawer({ title, children }: HelpDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button className="text-text-muted" aria-label={`Ajuda: ${title}`}>
          <HelpCircle className="size-4" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 rounded-t-2xl bg-surface px-5 pb-8 pt-4 outline-none">
          <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-text-muted/30" />
          <Drawer.Title className="text-base font-bold text-text">
            {title}
          </Drawer.Title>
          <div className="mt-3 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-text-muted">
            {children}
          </div>
          <Drawer.Close asChild>
            <button className="mt-5 w-full rounded-lg bg-surface-light py-2.5 text-sm font-medium text-text">
              Entendi
            </button>
          </Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
