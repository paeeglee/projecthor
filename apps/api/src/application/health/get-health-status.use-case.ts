import type { HealthStatus } from "../../domain/health/health.entity";
import type { IHealthRepository } from "../../domain/health/health.repository";

export class GetHealthStatusUseCase {
  constructor(private readonly healthRepository: IHealthRepository) {}

  async execute(): Promise<HealthStatus> {
    return this.healthRepository.getStatus();
  }
}
