import type { ChatRequest, ChatResponse } from "../../domain/ai/ai.types";
import type { IAiClientRepository } from "../../domain/ai/ai-client.repository";

const MOCK_RESPONSE = JSON.stringify({
  name: "Beginner 5-Day Muscle Building Plan",
  groups: [
    {
      name: "A",
      exercises: [
        {
          exerciseSlug: "machine-bench-press",
          sets: 3,
          reps: "8-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "incline-dumbbell-press",
          sets: 3,
          reps: "8-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "cable-crossover",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
        },
        {
          exerciseSlug: "triceps-pushdown",
          sets: 3,
          reps: "10-15",
          restSeconds: 60,
        },
        { exerciseSlug: "bench-dips", sets: 3, reps: "10-15", restSeconds: 60 },
        { exerciseSlug: "pushups", sets: 2, reps: "Max", restSeconds: 60 },
      ],
    },
    {
      name: "B",
      exercises: [
        {
          exerciseSlug: "wide-grip-lat-pulldown",
          sets: 3,
          reps: "8-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "seated-cable-rows",
          sets: 3,
          reps: "8-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "leverage-high-row",
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "one-arm-dumbbell-row",
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "dumbbell-bicep-curl",
          sets: 3,
          reps: "10-12",
          restSeconds: 60,
        },
        {
          exerciseSlug: "hammer-curls",
          sets: 3,
          reps: "10-12",
          restSeconds: 60,
        },
      ],
    },
    {
      name: "C",
      exercises: [
        { exerciseSlug: "leg-press", sets: 4, reps: "10-15", restSeconds: 90 },
        {
          exerciseSlug: "bodyweight-squat",
          sets: 3,
          reps: "15-20",
          restSeconds: 60,
        },
        {
          exerciseSlug: "lying-leg-curls",
          sets: 3,
          reps: "10-15",
          restSeconds: 75,
        },
        {
          exerciseSlug: "leg-extensions",
          sets: 3,
          reps: "10-15",
          restSeconds: 75,
        },
        {
          exerciseSlug: "standing-calf-raises",
          sets: 4,
          reps: "12-20",
          restSeconds: 60,
        },
        {
          exerciseSlug: "butt-lift-bridge",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
        },
      ],
    },
    {
      name: "D",
      exercises: [
        {
          exerciseSlug: "seated-dumbbell-press",
          sets: 3,
          reps: "8-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "side-lateral-raise",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
        },
        {
          exerciseSlug: "front-dumbbell-raise",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
        },
        {
          exerciseSlug: "reverse-flyes",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
        },
        { exerciseSlug: "plank", sets: 3, reps: "30-45s", restSeconds: 60 },
        {
          exerciseSlug: "cable-crunch",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
        },
      ],
    },
    {
      name: "E",
      exercises: [
        {
          exerciseSlug: "trap-bar-deadlift",
          sets: 3,
          reps: "8-10",
          restSeconds: 120,
        },
        {
          exerciseSlug: "goblet-squat",
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
        },
        {
          exerciseSlug: "incline-push-up",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
        },
        {
          exerciseSlug: "inverted-row",
          sets: 3,
          reps: "10-12",
          restSeconds: 75,
        },
        {
          exerciseSlug: "dumbbell-lunges",
          sets: 3,
          reps: "10-12",
          restSeconds: 75,
        },
        {
          exerciseSlug: "exercise-ball-crunch",
          sets: 3,
          reps: "15-20",
          restSeconds: 60,
        },
      ],
    },
  ],
});

export class MockAiClientRepository implements IAiClientRepository {
  async chat(_request: ChatRequest): Promise<ChatResponse> {
    return { content: MOCK_RESPONSE };
  }
}
