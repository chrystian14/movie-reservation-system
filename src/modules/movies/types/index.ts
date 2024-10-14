import type z from "zod";
import type {
  movieCreateInputSchema,
  movieSchema,
  movieUpdateInputSchema,
} from "./schemas";

export type Movie = z.infer<typeof movieSchema>;
export type MovieCreateInput = z.infer<typeof movieCreateInputSchema>;
export type MovieUpdateInput = z.infer<typeof movieUpdateInputSchema>;
