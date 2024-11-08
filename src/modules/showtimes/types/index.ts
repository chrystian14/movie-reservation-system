import type z from "zod";
import type {
  showtimeCreateInputSchema,
  showtimeDateQueryParamSchema,
  showtimeSchema,
} from "./schemas";

export type Showtime = z.infer<typeof showtimeSchema>;
export type ShowtimeCreateInput = z.infer<typeof showtimeCreateInputSchema>;
export type ShowtimeDateQueryParam = z.infer<
  typeof showtimeDateQueryParamSchema
>;
export type ShowtimeWithCount = { count: number; showtimes: Array<Showtime> };
