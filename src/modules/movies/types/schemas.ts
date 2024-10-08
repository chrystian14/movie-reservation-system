import z from "zod";

export const movieSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  posterUrl: z.string().url(),
  genreId: z.string().uuid(),
});

export const movieCreateInputSchema = movieSchema.omit({
  id: true,
});
