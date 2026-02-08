import { useState } from "react";
import { useNavigate } from "react-router";
import { useUserStore } from "@/modules/auth/stores/user-store";
import { Button } from "@/modules/shared/ui/button";
import { ActivePlanCarousel } from "./active-plan-carousel";
import { RelativeStrengthCard } from "./relative-strength-card";
import { WeekGoals } from "./week-goals";
import { WorkoutSummary } from "./workout-summary";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "\u{1F31E} Bom dia";
  if (hour >= 12 && hour < 18) return "\u2600\uFE0F Boa tarde";
  return "\u{1F319} Boa noite";
}

export function HomePage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const [nextGroupId, setNextGroupId] = useState<string | null>(null);

  function handleSignOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    clearUser();
    navigate("/signin");
  }

  return (
    <div className="flex min-h-svh flex-col gap-6 py-6">
      <h1 className="text-2xl font-bold">
        {getGreeting()}, {user?.fullName?.split(" ")[0]}!
      </h1>
      <WeekGoals />
      <WorkoutSummary onNextGroupResolved={setNextGroupId} />
      <RelativeStrengthCard />
      <ActivePlanCarousel initialGroupId={nextGroupId} />
      <Button variant="outline" onClick={handleSignOut}>
        Sair
      </Button>
    </div>
  );
}
