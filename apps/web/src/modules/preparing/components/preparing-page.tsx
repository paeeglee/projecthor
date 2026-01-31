import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { generateWorkout } from "@/modules/preparing/services/preparing";
import { Button } from "@/modules/shared/ui/button";

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Dumbbell</title>
      <rect x="8" y="20" width="8" height="24" rx="2" fill="currentColor" />
      <rect x="2" y="24" width="6" height="16" rx="2" fill="currentColor" />
      <rect x="48" y="20" width="8" height="24" rx="2" fill="currentColor" />
      <rect x="56" y="24" width="6" height="16" rx="2" fill="currentColor" />
      <rect x="16" y="28" width="32" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}

export function PreparingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fromOnboarding = location.state?.fromOnboarding === true;

  const callGenerate = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      await generateWorkout();
      navigate("/home", { replace: true });
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (fromOnboarding) {
      callGenerate();
    }
  }, [fromOnboarding, callGenerate]);

  if (!fromOnboarding) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6">
      <DumbbellIcon
        className={`size-16 text-primary ${loading ? "animate-spin" : ""}`}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-bold text-text">
          Preparing your workout...
        </h1>
        <p className="text-sm text-text-muted">
          {error
            ? "Something went wrong"
            : "We're crafting the perfect plan for you"}
        </p>
      </div>
      {error && <Button onClick={callGenerate}>Retry</Button>}
    </div>
  );
}
