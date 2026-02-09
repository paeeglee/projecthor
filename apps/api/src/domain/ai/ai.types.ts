export type Role = "system" | "user";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  content: string;
}

export interface GeneratedWorkoutExercise {
  exerciseSlug: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface GeneratedWorkoutGroup {
  name: string;
  exercises: GeneratedWorkoutExercise[];
}

export interface GeneratedWorkout {
  name: string;
  groups: GeneratedWorkoutGroup[];
}
