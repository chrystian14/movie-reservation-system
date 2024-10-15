import type z from "zod";
import type { showtimeCreateInputSchema, showtimeSchema } from "./schemas";

export type Showtime = z.infer<typeof showtimeSchema>;
export type ShowtimeCreateInput = z.infer<typeof showtimeCreateInputSchema>;
