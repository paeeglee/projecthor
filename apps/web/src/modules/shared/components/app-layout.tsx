import { Outlet } from "react-router";

export function AppLayout() {
  return (
    <div className="px-4">
      <Outlet />
    </div>
  );
}
