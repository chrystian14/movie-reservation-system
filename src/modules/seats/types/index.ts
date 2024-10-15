import type z from "zod";
import type {
  seatCreateInputSchema,
  seatCreateWithoutRoomIdSchema,
  seatSchema,
} from "./schemas";

export type Seat = z.infer<typeof seatSchema>;
export type SeatCreateInput = z.infer<typeof seatCreateInputSchema>;
export type SeatWithoutRoomId = z.infer<typeof seatCreateWithoutRoomIdSchema>;
