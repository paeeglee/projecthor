import { env } from "./infrastructure/config/env";
import { Elysia } from "elysia";
import { container } from "./container";
import { healthPlugin } from "./presentation/health/health.plugin";

const port = env.PORT ?? 3000;

new Elysia()
  .use(healthPlugin(container.getHealthStatusUseCase))
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
