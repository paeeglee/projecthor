import { Elysia } from "elysia";
import type { GetHealthStatusUseCase } from "../../application/health/get-health-status.use-case";

export const healthPlugin = (useCase: GetHealthStatusUseCase) =>
  new Elysia({ prefix: "/health" }).get("/", async () => {
    const result = await useCase.execute();
    return {
      status: result.status,
      timestamp: result.timestamp.toISOString(),
    };
  });
