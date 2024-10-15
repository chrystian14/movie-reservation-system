import type { Showtime, ShowtimeCreateInput } from "../types";

export interface IShowtimeRepository {
  create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime>;
  count(): Promise<number>;
}
