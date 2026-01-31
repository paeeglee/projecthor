import { useNavigate } from "react-router";
import { Button } from "@/modules/shared/ui/button";

export function HomePage() {
  const navigate = useNavigate();

  function handleSignOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
