import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET_KEY: z.string(),
  JWT_EXPIRES_IN: z.string(),
  PORT: z.coerce.number().default(3000),
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

export const parsedEnv = validateEnvVars();
