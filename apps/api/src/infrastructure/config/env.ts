import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const AiClientEnum = Type.Union([
  Type.Literal("openai"),
  Type.Literal("gemini"),
  Type.Literal("grok"),
  Type.Literal("mock"),
]);

const EnvSchema = Type.Object({
  PORT: Type.Optional(Type.String({ default: "3000" })),
  SUPABASE_URL: Type.String(),
  SUPABASE_ANON_KEY: Type.String(),
  SUPABASE_SERVICE_ROLE_KEY: Type.String(),
  AI_CLIENT: Type.Optional(AiClientEnum),
  AI_MODEL: Type.Optional(Type.String()),
  XAI_API_KEY: Type.Optional(Type.String()),
  OPENAI_API_KEY: Type.Optional(Type.String()),
  GEMINI_API_KEY: Type.Optional(Type.String()),
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

  const env = defaulted as Env;
  const aiClient = env.AI_CLIENT ?? "mock";

  if (aiClient === "openai" && !env.OPENAI_API_KEY) {
    throw new Error("AI_CLIENT is 'openai' but OPENAI_API_KEY is not set");
  }
  if (aiClient === "gemini" && !env.GEMINI_API_KEY) {
    throw new Error("AI_CLIENT is 'gemini' but GEMINI_API_KEY is not set");
  }
  if (aiClient === "grok" && !env.XAI_API_KEY) {
    throw new Error("AI_CLIENT is 'grok' but XAI_API_KEY is not set");
  }

  return env;
}

export const env = loadEnv();
