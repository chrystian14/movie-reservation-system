import type { Seat } from "modules/seats/types";
import type { ShowtimeCreateInput, Showtime } from "../types";

export interface IShowtimeService {
  create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime>;
  list(): Promise<Array<Showtime>>;
  getAvailableSeats(showtimeId: string): Promise<Array<Seat>>;
}
