import type z from "zod";
import type {
  reservationCreateInputSchema,
  reservationCreateWithoutUserSchema,
  reservationSchema,
} from "./schemas";

export type Reservation = z.infer<typeof reservationSchema>;
export type ReservationCreateInput = z.infer<
  typeof reservationCreateInputSchema
>;
export type ReservationCreateInputWithoutUserId = z.infer<
  typeof reservationCreateWithoutUserSchema
>;
