import type { IRoomDao } from "modules/rooms/dao";
import type { IShowtimeDao } from "../dao";
import type {
  Showtime,
  ShowtimeCreateInput,
  ShowtimeWithCount,
} from "../types";
import type { IShowtimeService } from "./showtime.service.interface";
import type { IMovieDao } from "modules/movies/dao";
import { RoomNotFoundError } from "modules/rooms/errors";
import { MovieNotFoundError } from "modules/movies/errors";
import { DatetimeInThePastError } from "../errors";
import type { Seat } from "modules/seats/types";
import type { ISeatDao } from "modules/seats/dao";
import { ShowtimeNotFoundError } from "../errors/showtime.errors";
import { MAX_PER_PAGE_NUMBER } from "modules/_shared/pagination/pagination.middleware";

export class ShowtimeService implements IShowtimeService {
  constructor(
    private readonly showtimeDao: IShowtimeDao,
    private readonly roomDao: IRoomDao,
    private readonly movieDao: IMovieDao,
    private readonly seatDao: ISeatDao
  ) {}

  async create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime> {
    const roomCount = await this.roomDao.countById(showtimeCreateInput.roomId);

    if (!roomCount) {
      throw new RoomNotFoundError();
    }

    const movieCount = await this.movieDao.countById(
      showtimeCreateInput.movieId
    );

    if (!movieCount) {
      throw new MovieNotFoundError();
    }

    if (showtimeCreateInput.datetime < new Date()) {
      throw new DatetimeInThePastError();
    }

    return await this.showtimeDao.create(showtimeCreateInput);
  }

  async list(
    dateFilter?: string,
    page: number = 1,
    perPage: number = MAX_PER_PAGE_NUMBER
  ): Promise<ShowtimeWithCount> {
    const showtimeCount = await this.showtimeDao.count();

    if (dateFilter) {
      const startDate = new Date(dateFilter);
      const oneDayAfterStartDate = new Date(
        startDate.getTime() + 1 * 24 * 60 * 60 * 1000
      );

      const showtimesByDate = await this.showtimeDao.listByDate(
        startDate,
        oneDayAfterStartDate,
        page,
        perPage
      );

      return { count: showtimeCount, showtimes: showtimesByDate };
    }

    const showtimes = await this.showtimeDao.list(page, perPage);

    return { count: showtimeCount, showtimes };
  }

  async getAvailableSeats(showtimeId: string): Promise<Array<Seat>> {
    const showtimeCount = await this.showtimeDao.countById(showtimeId);

    if (!showtimeCount) {
      throw new ShowtimeNotFoundError();
    }

    return await this.seatDao.getAvailableSeats(showtimeId);
  }
}
