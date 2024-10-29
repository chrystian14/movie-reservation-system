import z from "zod";
import { ReservationStatus } from "@prisma/client";
import { toDecimal } from "modules/_shared/utils";

export const reservationSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ReservationStatus).default(ReservationStatus.CONFIRMED),
  amountPaid: z
    .number()
    .nonnegative()
    .multipleOf(0.01)
    .transform((value) => toDecimal(value)),
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
