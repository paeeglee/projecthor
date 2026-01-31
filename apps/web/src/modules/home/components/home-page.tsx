import { useNavigate } from "react-router";
import { useUserStore } from "@/modules/auth/stores/user-store";
import { Button } from "@/modules/shared/ui/button";
import { WeekGoals } from "./week-goals";

export function HomePage() {
  const navigate = useNavigate();
  const clearUser = useUserStore((state) => state.clearUser);

  function handleSignOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    clearUser();
    navigate("/signin");
  }

  return (
    <div className="flex min-h-svh flex-col gap-6 py-6">
      <WeekGoals />
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
