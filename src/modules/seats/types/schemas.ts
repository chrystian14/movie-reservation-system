import { Prisma } from "@prisma/client";
import z from "zod";

export const seatSchema = z.object({
  id: z.string().uuid(),
  column: z.string().length(1),
  row: z.number(),
  price: z
    .custom<Prisma.Decimal.Value>(
      (v) =>
        typeof v === "string" ||
        typeof v === "number" ||
        Prisma.Decimal.isDecimal(v)
    )
    .transform((v) => new Prisma.Decimal(v)),
  roomId: z.string().uuid(),
});

export const seatCreateInputSchema = seatSchema.omit({
  id: true,
});
