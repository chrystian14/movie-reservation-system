import type z from "zod";
import type { roomCreateInputSchema, roomSchema } from "./schemas";

export type Room = z.infer<typeof roomSchema>;
export type RoomCreateInput = z.infer<typeof roomCreateInputSchema>;
