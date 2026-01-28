import type { HealthStatus } from "./health.entity";

export interface IHealthRepository {
  getStatus(): Promise<HealthStatus>;
}
