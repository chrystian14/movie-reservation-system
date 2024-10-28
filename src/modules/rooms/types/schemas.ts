import { Prisma } from "@prisma/client";
import z from "zod";

export const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(50),
  rows: z.number().int().nonnegative().max(500),
  columns: z.number().int().nonnegative().max(500),
  baseSeatPrice: z
    .custom<Prisma.Decimal.Value>(
      (v) =>
        typeof v === "string" ||
        typeof v === "number" ||
        Prisma.Decimal.isDecimal(v)
    )
    .transform((v) => new Prisma.Decimal(v)),
});

export const roomCreateInputSchema = roomSchema.omit({
  id: true,
});
