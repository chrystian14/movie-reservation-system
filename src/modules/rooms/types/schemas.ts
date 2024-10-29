import { toDecimal } from "modules/_shared/utils";
import z from "zod";

export const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  rows: z.number().int().nonnegative().max(500),
  columns: z.number().int().nonnegative().max(500),
  baseSeatPrice: z
    .number()
    .nonnegative()
    .multipleOf(0.01, {
      message: "Must be in decimal format with 2 decimal places",
    })
    .transform((value) => toDecimal(value)),
});

export const roomCreateInputSchema = roomSchema.omit({
  id: true,
});
