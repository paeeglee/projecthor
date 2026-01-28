import { env } from "./infrastructure/config/env";
import { Elysia } from "elysia";
import { container } from "./container";
import { healthPlugin } from "./presentation/health/health.plugin";

const port = Number(env.PORT);

new Elysia()
  .use(healthPlugin(container.getHealthStatusUseCase))
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
