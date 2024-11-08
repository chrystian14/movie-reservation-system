import type { Seat } from "modules/seats/types";
import type {
  ShowtimeCreateInput,
  Showtime,
  ShowtimeWithCount,
} from "../types";

export interface IShowtimeService {
  create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime>;
  list(
    dateFilter?: string,
    page?: number,
    perPage?: number
  ): Promise<ShowtimeWithCount>;
  getAvailableSeats(showtimeId: string): Promise<Array<Seat>>;
}
