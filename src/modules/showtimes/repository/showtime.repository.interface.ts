import type { Showtime, ShowtimeCreateInput } from "../types";

export interface IShowtimeRepository {
  create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime>;
  list(page: number, perPage: number): Promise<Array<Showtime>>;
  listByDate(
    startDate: Date,
    endDate: Date,
    page: number,
    perPage: number
  ): Promise<Array<Showtime>>;
  count(): Promise<number>;
  countById(showtimeId: string): Promise<number>;
  findById(showtimeId: string): Promise<Showtime | null>;
}
