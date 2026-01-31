import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import { PreparingPage } from "./preparing-page";

vi.mock("@/modules/preparing/services/preparing", () => ({
  generateWorkout: vi.fn(),
}));

import { generateWorkout } from "@/modules/preparing/services/preparing";

const mockedGenerate = vi.mocked(generateWorkout);

function renderWithRouter({
  fromOnboarding = true,
}: {
  fromOnboarding?: boolean;
} = {}) {
  const initialEntries = [
    {
      pathname: "/preparing",
      state: fromOnboarding ? { fromOnboarding: true } : null,
    },
  ];

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/preparing" element={<PreparingPage />} />
        <Route path="/home" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PreparingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /home when not coming from onboarding", () => {
    renderWithRouter({ fromOnboarding: false });
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("shows loading state and calls generateWorkout on mount", () => {
    mockedGenerate.mockReturnValue(new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByText("Preparing your workout...")).toBeInTheDocument();
    expect(
      screen.getByText("We're crafting the perfect plan for you"),
    ).toBeInTheDocument();
    expect(mockedGenerate).toHaveBeenCalledOnce();
  });

  it("navigates to /home on successful generation", async () => {
    mockedGenerate.mockResolvedValue(undefined);
    renderWithRouter();
    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });

  it("shows error state with retry button on failure", async () => {
    mockedGenerate.mockRejectedValue(new Error("API Error"));
    renderWithRouter();
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("retries the API call when retry button is clicked", async () => {
    const user = userEvent.setup();
    mockedGenerate.mockRejectedValueOnce(new Error("API Error"));
    mockedGenerate.mockResolvedValueOnce(undefined);
    renderWithRouter();
    const retryButton = await screen.findByRole("button", { name: "Retry" });
    await user.click(retryButton);
    expect(await screen.findByText("Home Page")).toBeInTheDocument();
    expect(mockedGenerate).toHaveBeenCalledTimes(2);
  });
});
