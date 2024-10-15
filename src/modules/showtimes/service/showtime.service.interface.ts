import type { ShowtimeCreateInput, Showtime } from "../types";

export interface IShowtimeService {
  create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime>;
}
