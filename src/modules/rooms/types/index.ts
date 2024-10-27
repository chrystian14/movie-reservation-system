import type z from "zod";
import type { roomCreateInputSchema, roomSchema } from "./schemas";
import type { Seat } from "modules/seats/types";

export type Room = z.infer<typeof roomSchema>;
export type RoomCreateInput = z.infer<typeof roomCreateInputSchema>;
export type RoomAndSeats = { room: Room; seats: Seat[] };
