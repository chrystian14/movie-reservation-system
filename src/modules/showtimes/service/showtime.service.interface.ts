import type { Seat } from "modules/seats/types";
import type { ShowtimeCreateInput, Showtime } from "../types";

export interface IShowtimeService {
  create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime>;
  getAvailableSeats(showtimeId: string): Promise<Array<Seat>>;
}
