import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { MobileOnly } from "./modules/shared/components/mobile-only";
import { router } from "./router";

export function App() {
  return (
    <MobileOnly>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-sans)",
            width: "100%",
          },
        }}
        style={{ width: "100%" }}
      />
    </MobileOnly>
  );
}
