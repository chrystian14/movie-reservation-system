import type z from "zod";
import type { loginInputSchema } from "./schemas";

export type LoginInput = z.infer<typeof loginInputSchema>;
