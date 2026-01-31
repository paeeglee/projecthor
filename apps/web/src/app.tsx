import { RouterProvider } from "react-router";
import { MobileOnly } from "./modules/shared/components/mobile-only";
import { router } from "./router";

export function App() {
  return (
    <MobileOnly>
      <RouterProvider router={router} />
    </MobileOnly>
  );
}
