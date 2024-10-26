import type { Showtime, ShowtimeCreateInput } from "../types";

export interface IShowtimeRepository {
  create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime>;
  list(): Promise<Array<Showtime>>;
  listByDate(startDate: Date, endDate: Date): Promise<Array<Showtime>>;
  count(): Promise<number>;
  countById(showtimeId: string): Promise<number>;
}
