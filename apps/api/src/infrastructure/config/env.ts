import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const EnvSchema = Type.Object({
  PORT: Type.Optional(Type.String({ default: "3000" })),
  SUPABASE_URL: Type.String(),
  SUPABASE_ANON_KEY: Type.String(),
  SUPABASE_SERVICE_ROLE_KEY: Type.String(),
});

type Env = Static<typeof EnvSchema>;

function loadEnv(): Env {
  const cleaned = Value.Clean(EnvSchema, process.env);
  const defaulted = Value.Default(EnvSchema, cleaned);

  if (!Value.Check(EnvSchema, defaulted)) {
    const errors = [...Value.Errors(EnvSchema, defaulted)];
    const messages = errors
      .map((e) => `  - ${e.path}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${messages}`);
  }

  return defaulted as Env;
}

export const env = loadEnv();
