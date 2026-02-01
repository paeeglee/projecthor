export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  bodyWeight: number | null;
  bodyWeightUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
