import type z from "zod";
import type { movieCreateInputSchema, movieSchema } from "./schemas";

export type Movie = z.infer<typeof movieSchema>;
export type MovieCreateInput = z.infer<typeof movieCreateInputSchema>;
