import z from "zod";
import { Prisma, ReservationStatus } from "@prisma/client";

export const reservationSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ReservationStatus).default(ReservationStatus.CONFIRMED),
  amountPaid: z
    .custom<Prisma.Decimal.Value>(
      (v) =>
        typeof v === "string" ||
        typeof v === "number" ||
        Prisma.Decimal.isDecimal(v)
    )
    .transform((v) => new Prisma.Decimal(v)),
  userId: z.string().uuid(),
  showtimeId: z.string().uuid(),
  seatId: z.string().uuid(),
});

export const reservationCreateInputSchema = reservationSchema
  .omit({
    id: true,
    status: true,
    seatId: true,
  })
  .extend({
    seatIds: z
      .string()
      .uuid()
      .array()
      .nonempty({ message: "At least one seatId is required" }),
  });

export const reservationCreateWithoutUserSchema =
  reservationCreateInputSchema.omit({
    userId: true,
  });
