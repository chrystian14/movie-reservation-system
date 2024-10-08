import type z from "zod";
import type { genreCreateInputSchema, genreSchema } from "./schemas";

export type Genre = z.infer<typeof genreSchema>;
export type GenreCreateInput = z.infer<typeof genreCreateInputSchema>;
