export interface WorkoutPlan {
  id: string;
  athleteId: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
