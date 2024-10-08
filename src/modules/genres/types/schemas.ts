import z from "zod";

export const genreSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1)
    .max(50)
    .transform((val) => val.toLowerCase()),
});

export const genreCreateInputSchema = genreSchema.omit({
  id: true,
});
