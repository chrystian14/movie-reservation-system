import { toDecimal } from "modules/_shared/utils";
import z from "zod";

export const seatSchema = z.object({
  id: z.string().uuid(),
  column: z.string().length(1),
  row: z.number().positive().int(),
  price: z
    .number()
    .nonnegative()
    .multipleOf(0.01)
    .transform((value) => toDecimal(value)),
  roomId: z.string().uuid(),
});

export const seatCreateInputSchema = seatSchema.omit({
  id: true,
});

export const seatCreateWithoutRoomIdSchema = seatSchema.omit({
  id: true,
  roomId: true,
});
