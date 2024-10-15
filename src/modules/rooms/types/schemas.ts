import { Prisma } from "@prisma/client";
import z from "zod";

export const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(50),
  rows: z.number(),
  columns: z.number(),
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
