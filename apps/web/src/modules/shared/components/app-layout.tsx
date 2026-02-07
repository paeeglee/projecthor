import { Outlet } from "react-router";
import { useProfile } from "@/modules/auth/hooks/use-profile";

export function AppLayout() {
  const { isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="px-4">
      <Outlet />
    </div>
  );
}
