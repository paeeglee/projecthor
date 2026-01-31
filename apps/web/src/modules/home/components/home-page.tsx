import { useNavigate } from "react-router";
import { useUserStore } from "@/modules/auth/stores/user-store";
import { Button } from "@/modules/shared/ui/button";

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
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
