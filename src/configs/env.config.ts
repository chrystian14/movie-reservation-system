import z from "zod";
import dotenv from "dotenv";

export enum NodeEnv {
  dev = "dev",
  prod = "prod",
  test = "test",
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET_KEY: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.nativeEnum(NodeEnv).default(NodeEnv.dev),
});

function validateEnvVars() {
  const parseResult = envSchema.safeParse(process.env);

  if (!parseResult.success) {
    const errorMessage = formatEnvVarErrors(parseResult.error);
    throw new Error(errorMessage);
  }

  return parseResult.data;
}

function formatEnvVarErrors(error: z.ZodError) {
  const errors = error.errors
    .map(({ path, message }) => `Variable '${path}': ${message}`)
    .join("\n");

  const errorMessage = `Invalid enviroment variables: \n${errors}`;
  return errorMessage;
}

dotenv.config({ path: ".env" });
export const parsedEnv = validateEnvVars();
