import { GetHealthStatusUseCase } from "./application/health/get-health-status.use-case";
import { HealthRepository } from "./infrastructure/health/health.repository";

const healthRepository = new HealthRepository();
const getHealthStatusUseCase = new GetHealthStatusUseCase(healthRepository);

export const container = {
  getHealthStatusUseCase,
};
