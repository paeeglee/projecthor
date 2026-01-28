import type { HealthStatus } from "../../domain/health/health.entity";
import type { IHealthRepository } from "../../domain/health/health.repository";

export class HealthRepository implements IHealthRepository {
  async getStatus(): Promise<HealthStatus> {
    return {
      status: "ok",
      timestamp: new Date(),
    };
  }
}
