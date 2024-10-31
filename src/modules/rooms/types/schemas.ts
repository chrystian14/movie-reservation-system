import z from "zod";

export const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  number: z.number().nonnegative().min(1).max(100),
});

export const roomCreateInputSchema = roomSchema.omit({
  id: true,
});
