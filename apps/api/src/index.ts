import { Elysia } from "elysia";
import { container } from "./container";
import { env } from "./infrastructure/config/env";
import { authPlugin } from "./presentation/auth/auth.plugin";
import { exercisePlugin } from "./presentation/exercise/exercise.plugin";
import { healthPlugin } from "./presentation/health/health.plugin";

const port = Number(env.PORT);

new Elysia()
  .use(healthPlugin(container.getHealthStatusUseCase))
  .use(
    authPlugin({
      signUp: container.signUpUseCase,
      signIn: container.signInUseCase,
      revalidate: container.revalidateUseCase,
      resetPassword: container.resetPasswordUseCase,
      confirmResetPassword: container.confirmResetPasswordUseCase,
    }),
  )
  .use(exercisePlugin(container.getExerciseBySlugUseCase))
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
